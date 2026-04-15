# Intrusion Detection Dashboard

## Setup

### Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend/ids-dashboard
npm install
npm run dev