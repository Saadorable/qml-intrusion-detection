export type PredictionResponse = {
  predicted_class: string;
  predicted_index: number;
  probabilities: number[];
};

export async function predictTraffic(features: Record<string, number>) {
  const res = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ features }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Prediction request failed");
  }

  return (await res.json()) as PredictionResponse;
}

export async function getFeatureStats() {
  const res = await fetch("http://localhost:8000/feature-stats");

  if (!res.ok) {
    throw new Error("Failed to load feature stats");
  }

  return res.json();
}