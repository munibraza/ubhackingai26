# FolLand

A tomato-growing decision-support prototype combining a mobile photo, simulated environmental sensors, weather, and cited guidance. It produces harvest, watering, and fertilizer advisory cards. It is a hackathon prototype, not a validated agricultural diagnostic system.

## Quick start

Requirements: Python 3.10+, Node.js and npm.

```bash
# From the repository root
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

In a second terminal:

```bash
cd frontend
npm ci
npm run dev -- --host 0.0.0.0 --port 5173
```

Open `http://localhost:5173`. On a phone connected to the same network, use `http://<computer-ip>:5173`. The frontend development server proxies `/api` to the backend at port 8000. Backend API documentation is at `http://localhost:8000/docs`.

For Gemini image analysis, set `GEMINI_API_KEY` in a root `.env` file (see [.env.example](.env.example)) or enter a key in the app. Without a key, use a labeled demo scenario to exercise the recommendation rules. Keys entered in the UI are held only for the current page session; use a trusted device and network. Photos sent for analysis are sent to Google Gemini.

## Verify

```bash
# From the repository root, with the Python environment active
python -m pytest -q

# Frontend build
cd frontend
npm run build
```

## Project map

| Path | Purpose |
|---|---|
| `backend/app.py` | FastAPI endpoints and analysis orchestration |
| `backend/models.py` | API data models |
| `backend/services/` | Image analysis, simulated sensors, weather, and decision rules |
| `frontend/` | React, TypeScript, Vite, and Tailwind interface |
| `knowledge/` | Tomato guidance references used by the decision engine |
| `tests/` | Backend API and decision-engine tests |
| `docs/` | Architecture notes and original MVP proposal |

## Current boundaries

- Sensor readings are **simulated**; hardware firmware and a serial bridge are not implemented in this repository.
- Weather falls back to labeled mock data when the external service is unavailable. Review [known limitations](docs/architecture.md#known-limitations) before relying on weather evidence.
- Gemini analysis requires a key and an external API call. Demo scenarios do not analyze photo pixels.
- Air humidity is not soil moisture. Visual symptoms do not establish nutrient deficiencies.

See the [user guide](docs/user-guide.md), [architecture and known limitations](docs/architecture.md), and the [original MVP proposal and workflow](docs/mvp-proposal.md). The proposal describes intended features and hardware, not proof that they are implemented.
