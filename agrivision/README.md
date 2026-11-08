# AgriVision AI

A futuristic 3D smart-agriculture web app built on top of the FolLand prototype: an interactive tomato-farm digital twin, IoT sensor dashboard, photo-based crop analysis, weather intelligence, a 3D growth timeline and configurable smart alerts.

Built with Next.js 14 (App Router), React 18, TypeScript, Three.js + React Three Fiber + drei, Tailwind CSS, shadcn/ui-style components (Radix), Framer Motion, Recharts and Lucide.

## Run it

Requirements: Node.js 18.18+ (20 or 22 recommended).

```bash
cd agrivision
npm install
npm run dev
```

Open http://localhost:3000. For a production build: `npm run build && npm start`.

The app works on its own in **Demo Mode**. No hardware, API key or backend is needed.

### Optional: connect the FolLand backend (AI photo analysis)

In a second terminal, from the repository root:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --port 8000
```

The Next.js app proxies `/api/folland/*` to `http://127.0.0.1:8000/api/*` (override with `FOLLAND_API_URL`). With the backend running and a `GEMINI_API_KEY` set on it (or entered on the Crop AI page), photos are analyzed by Gemini. Without it, the page uses a clearly labeled in-browser color heuristic.

## Pages

| Route | What it does |
|---|---|
| `/` | Cinematic 3D hero farm with hotspots, live stats, weather switcher, feature overview |
| `/farm` | Digital twin: click plants and sensors, select zones, health overlay, sunny/cloudy/rainy |
| `/dashboard` | Sensor cards with trends, interactive chart, Demo / Integration data source |
| `/analysis` | Photo upload and preview, AI or demo analysis, condition/ripeness/environment panels |
| `/weather` | Open-Meteo history and forecast, rainfall, humidity, growing degree days, alerts |
| `/growth` | Procedural 3D tomato from seedling to harvest with a timeline slider |
| `/alerts` | Recommendations fused from sensors, weather and camera, with editable thresholds |

## Data honesty

- **Demo Mode** simulates readings in the browser (diurnal model plus the selected weather). They are labeled "Demo data".
- **Integration Mode** polls any JSON endpoint (see the payload on the dashboard). Readings are labeled live only if the payload says `"live": true` or `"data_mode": "live"`. Nothing is filled in with simulated values when the endpoint is down.
- **Weather** comes from Open-Meteo when reachable, otherwise from a labeled simulation.
- **Photo results** are labeled AI only when a connected model analyzed the image. Plant-level conditions in the digital twin are modeled from zone readings and a demo scouting log.

## Structure

```
src/
  app/            routes (one folder per page), layout, page transition template
  components/
    three/        3D: procedural plant geometry, instanced plant field, environment, farm, growth scene
    ui/           shadcn/ui-style primitives (button, card, slider, switch, tabs, sheet, tooltip…)
    layout/ sections/ dashboard/ farm/ analysis/ weather/ growth/ alerts/ charts/ shared/
  hooks/          quality tier, weather loading, alerts, plant states, animated numbers
  lib/            types, simulation, farm layout, recommendation rules, weather, analysis, store
```

## Performance

Plants, leaves, fruit, grass, trees and rain are instanced, so all 48 plants draw in a handful of calls. Scenes load lazily, pause when off screen, and adapt pixel ratio to frame rate. Small or low-power devices get a lite tier (fewer leaves, no shadows or grass), and browsers without WebGL get a static illustration. The tier can be forced on the Smart Farm page.
