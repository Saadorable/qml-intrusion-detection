from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import pennylane as qml
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ============================================================
# Paths / Config
# ============================================================
BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_DIR = BASE_DIR / "deployment_artifacts"

N_QUBITS = 8
N_LAYERS = 2

SCALER_PATH = ARTIFACT_DIR / "scaler.pkl"
LABEL_ENCODER_PATH = ARTIFACT_DIR / "label_encoder.pkl"
SELECTED_FEATURES_PATH = ARTIFACT_DIR / "selected_features.pkl"
MODEL_PATH = ARTIFACT_DIR / "best_qml_model.pt"

device = torch.device("cpu")

# ============================================================
# Load preprocessing artifacts
# ============================================================
scaler = joblib.load(SCALER_PATH)
le = joblib.load(LABEL_ENCODER_PATH)
selected_features = joblib.load(SELECTED_FEATURES_PATH)

if not isinstance(selected_features, (list, tuple)):
    selected_features = list(selected_features)

NUM_CLASSES = len(le.classes_)

# ============================================================
# Quantum circuit
# ============================================================
dev = qml.device("default.qubit", wires=N_QUBITS)

weight_shapes = {
    "rot_weights": (N_LAYERS, N_QUBITS, 3),
    "ent_weights": (N_LAYERS, N_QUBITS),
}

@qml.qnode(dev, interface="torch", diff_method="backprop")
def quantum_circuit(inputs, rot_weights, ent_weights):
    qml.AngleEmbedding(inputs, wires=range(N_QUBITS), rotation="Y")

    for l in range(N_LAYERS):
        for i in range(N_QUBITS):
            qml.Rot(
                rot_weights[l, i, 0],
                rot_weights[l, i, 1],
                rot_weights[l, i, 2],
                wires=i,
            )

        for i in range(N_QUBITS):
            j = (i + 1) % N_QUBITS
            qml.IsingXX(ent_weights[l, i], wires=[i, j])

    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

qlayer = qml.qnn.TorchLayer(quantum_circuit, weight_shapes)

# ============================================================
# Model definition
# ============================================================
class HybridCNNQML(nn.Module):
    def __init__(self, n_features: int, n_classes: int):
        super().__init__()

        self.cnn = nn.Sequential(
            nn.Conv1d(1, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv1d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveMaxPool1d(1),
            nn.Flatten(),
        )

        self.to_quantum = nn.Linear(256, N_QUBITS)
        self.q = qlayer
        self.head = nn.Linear(N_QUBITS, n_classes)

    def forward(self, x):
        x = x.to(device)
        x = x.unsqueeze(1)  # [batch, 1, n_features]
        x = self.cnn(x)
        x = self.to_quantum(x)
        x = torch.tanh(x)
        x = self.q(x)
        x = self.head(x)
        return x

# ============================================================
# Load trained weights
# ============================================================
model = HybridCNNQML(n_features=len(selected_features), n_classes=NUM_CLASSES)

state_dict = torch.load(MODEL_PATH, map_location="cpu")
model.load_state_dict(state_dict)
model.eval()

# ============================================================
# FastAPI app
# ============================================================
app = FastAPI(title="IDS Hybrid QML API")

class PredictionRequest(BaseModel):
    features: Dict[str, float]

class PredictionResponse(BaseModel):
    predicted_class: str
    predicted_index: int
    probabilities: List[float]

def preprocess_features(feature_dict: Dict[str, float]) -> np.ndarray:
    missing = [f for f in selected_features if f not in feature_dict]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing features: {missing}"
        )

    ordered = np.array(
        [feature_dict[f] for f in selected_features],
        dtype=np.float32
    ).reshape(1, -1)

    scaled = scaler.transform(ordered)
    return scaled.astype(np.float32)

@app.get("/")
def root():
    return {"message": "IDS QML API is running"}

@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    X = preprocess_features(req.features)
    X_tensor = torch.tensor(X, dtype=torch.float32)

    try:
        with torch.no_grad():
            logits = model(X_tensor)
            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
            pred_idx = int(np.argmax(probs))
            pred_class = le.inverse_transform([pred_idx])[0]

        return PredictionResponse(
            predicted_class=pred_class,
            predicted_index=pred_idx,
            probabilities=probs.tolist()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))