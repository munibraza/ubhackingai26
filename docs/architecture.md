# Architecture and current implementation

## Request flow

1. The React frontend requests sensor and weather summaries from FastAPI.
2. An analysis request submits a photo or demo scenario and user-provided plant details.
3. The backend obtains simulated sensor values and weather, optionally calls Gemini, and passes the resulting observations to the decision engine.
4. The decision engine returns harvest, watering, and fertilizer cards with evidence and references from `knowledge/tomato_rules.json`.

The Vite development server proxies `/api` to `localhost:8000`. This proxy is a development configuration; a production deployment must serve or proxy the API separately.

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Service and simulated sensor status |
| `GET /api/sensors/latest` | Simulated sensor values; optional disconnected simulation |
| `GET /api/weather` | Open-Meteo weather or mock fallback |
| `POST /api/analyze` | Form-based plant analysis and recommendation cards |

Interactive request schemas are available at `/docs` on the backend.

## Known limitations

- There is no physical sensor bridge or firmware in the current repository. The sensor service generates simulated values.
- Weather's daily precipitation fields are currently presented as rolling 24-hour values, and recommendation evidence does not distinguish mock fallback from live weather.
- The weather location selected in the dashboard is not sent with the analysis form; analysis defaults to Buffalo unless coordinates are supplied directly to the API.
- The Gemini prompt describes the simulated sensor readings as live; some harvest-card text describes Gemini results as a demo scenario.
- HEIC uploads are labeled as JPEG for Gemini without converting the image bytes. Real iPhone photo compatibility needs verification.
- A UI-entered Gemini key is held in page memory. The local development setup uses HTTP.
- Automated tests cover simulated behavior and API contracts, not field accuracy or physical hardware.

## Proposal versus implementation

The [original MVP proposal](mvp-proposal.md) is retained for product rationale, hardware research, and demo planning. Its recommended architecture, firmware examples, acceptance checklist, and roadmap are proposals; use the code and this document for current implementation status.
