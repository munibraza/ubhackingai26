import type { AnalysisResult, CropCondition, EnvironmentRating, Ripeness, SensorReading, Thresholds } from "./types";
import { round } from "./utils";

type ColorStats = NonNullable<AnalysisResult["colorStats"]>;

/** Pixel color shares, computed in the browser from a downscaled copy of the photo. */
export async function measureColors(file: File): Promise<ColorStats> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("This image could not be decoded by the browser."));
      el.src = url;
    });
    const size = 112;
    const scale = Math.min(1, size / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas is unavailable.");
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    const c = { red: 0, orange: 0, green: 0, yellow: 0, brown: 0 };
    let counted = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const v = max, d = max - min, s = max === 0 ? 0 : d / max;
      if (s < 0.22 || v < 0.12) continue; // ignore greys, sky glare, shadows
      let hue = 0;
      if (d > 0) {
        if (max === r) hue = 60 * (((g - b) / d) % 6);
        else if (max === g) hue = 60 * ((b - r) / d + 2);
        else hue = 60 * ((r - g) / d + 4);
      }
      if (hue < 0) hue += 360;
      counted++;
      if ((hue < 14 || hue > 340) && v > 0.3) c.red++;
      else if (hue >= 14 && hue < 42 && v < 0.5) c.brown++;
      else if (hue >= 14 && hue < 42) c.orange++;
      else if (hue >= 42 && hue < 68) c.yellow++;
      else if (hue >= 68 && hue < 170) c.green++;
    }
    const n = Math.max(1, counted);
    return {
      red: c.red / n,
      orange: c.orange / n,
      green: c.green / n,
      yellow: c.yellow / n,
      brown: c.brown / n,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function rateEnvironment(r: SensorReading | null, t: Thresholds): { rating: EnvironmentRating; notes: string[] } {
  if (!r) return { rating: "monitor", notes: ["No sensor reading available."] };
  const notes: string[] = [];
  let score = 0;
  if (r.temperatureC > t.tempHighC) { score += 2; notes.push(`Air ${round(r.temperatureC)} °C is above the ${t.tempHighC} °C limit.`); }
  else if (r.temperatureC > t.tempHighC - 3) { score += 1; notes.push(`Air ${round(r.temperatureC)} °C is close to the heat limit.`); }
  if (r.temperatureC < t.tempLowC) { score += 2; notes.push(`Air ${round(r.temperatureC)} °C is below the ${t.tempLowC} °C limit.`); }
  if (r.humidityPct > t.humidityHighPct) { score += 1; notes.push(`Humidity ${round(r.humidityPct)}% raises fungal risk.`); }
  if (r.humidityPct < 35) { score += 1; notes.push(`Humidity ${round(r.humidityPct)}% is low and can stress flowers.`); }
  if (!notes.length) notes.push(`Air ${round(r.temperatureC)} °C and ${round(r.humidityPct)}% RH are within your limits.`);
  return { rating: score >= 2 ? "stressful" : score === 1 ? "monitor" : "favorable", notes };
}

function suggestionsFor(condition: CropCondition, ripeness: AnalysisResult["ripeness"], env: EnvironmentRating) {
  const s: string[] = [];
  if (ripeness === "ripe") s.push("Harvest fully colored fruit within 2–3 days for best flavor.");
  if (ripeness === "turning") s.push("Fruit is coloring. Pick at breaker stage to ripen indoors if rain or pests threaten.");
  if (ripeness === "unripe") s.push("Fruit is still green. Keep watering steady to avoid cracking and blossom-end rot.");
  if (ripeness === "overripe") s.push("Harvest now and remove soft or split fruit to avoid attracting pests.");
  if (condition === "attention") s.push("Check lower leaves for yellowing; uneven watering or nutrition are common causes.");
  if (condition === "disease") s.push("Isolate affected leaves, avoid overhead watering and confirm the symptom with an extension guide before treating.");
  if (env === "stressful") s.push("Conditions are outside your limits; review irrigation, shading and ventilation.");
  if (env === "monitor") s.push("Conditions are near your limits; recheck in a few hours.");
  if (!s.length) s.push("No action needed now. Re-scan weekly to track changes.");
  return s;
}

export function demoAnalysis(file: File, stats: ColorStats, reading: SensorReading | null, t: Thresholds): AnalysisResult {
  const foliage = stats.green + stats.yellow + stats.brown;
  const fruit = stats.red + stats.orange;
  let ripeness: AnalysisResult["ripeness"];
  if (fruit < 0.03 && stats.green > 0.4) ripeness = "not_applicable";
  else if (stats.red > 0.16 && stats.brown > 0.14) ripeness = "overripe";
  else if (stats.red > 0.16) ripeness = "ripe";
  else if (stats.red > 0.04 || stats.orange > 0.1) ripeness = "turning";
  else ripeness = "unripe";

  const yellowShare = foliage > 0 ? stats.yellow / foliage : 0;
  const brownShare = foliage > 0 ? stats.brown / foliage : 0;
  const symptoms: string[] = [];
  let cropCondition: CropCondition = "healthy";
  if (brownShare > 0.25 && foliage > 0.2) {
    cropCondition = "disease";
    symptoms.push(`Brown areas cover about ${Math.round(brownShare * 100)}% of plant-colored pixels`);
  } else if (yellowShare > 0.22 && foliage > 0.2) {
    cropCondition = "attention";
    symptoms.push(`Yellow tones cover about ${Math.round(yellowShare * 100)}% of foliage-colored pixels`);
  }
  if (!symptoms.length) symptoms.push("No unusual color patterns detected by the heuristic");

  const env = rateEnvironment(reading, t);
  return {
    id: `demo-${Date.now().toString(36)}`,
    createdAt: Date.now(),
    source: "demo",
    provider: "Demo color heuristic",
    imageName: file.name,
    cropCondition,
    ripeness,
    confidence: null,
    symptoms,
    summary:
      "Demo result. A simple pixel-color heuristic estimated these labels in your browser. No AI model looked at this photo, and the labels can be wrong for lighting, backgrounds or varieties that are not red when ripe.",
    suggestions: suggestionsFor(cropCondition, ripeness, env.rating),
    environment: env.rating,
    environmentNotes: env.notes,
    colorStats: stats,
  };
}

/* ---------- FolLand backend (FastAPI + Gemini) bridge ---------- */

export interface BackendStatus {
  reachable: boolean;
  app?: string;
}

export async function checkBackend(signal?: AbortSignal): Promise<BackendStatus> {
  try {
    const res = await fetch("/api/folland/health", { signal, cache: "no-store" });
    if (!res.ok) return { reachable: false };
    const j = await res.json();
    return { reachable: j?.status === "healthy", app: j?.app };
  } catch {
    return { reachable: false };
  }
}

const CONF_MAP: Record<string, number | null> = { high: 0.85, medium: 0.6, low: 0.35, none: null };

/**
 * Sends the photo to the FolLand backend. Returns null when the backend answered without
 * running the AI model (for example, no Gemini key), so the caller can fall back to demo mode.
 */
export async function aiAnalysis(
  file: File,
  apiKey: string,
  reading: SensorReading | null,
  t: Thresholds,
): Promise<AnalysisResult | null> {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("crop", "tomato");
  if (apiKey) fd.append("gemini_api_key", apiKey);
  const res = await fetch("/api/folland/analyze", { method: "POST", body: fd });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      if (j.detail) detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(detail || `Backend returned ${res.status}`);
  }
  const j = await res.json();
  const v = j.visual_observations ?? {};
  if (!v.ai_provider || v.ai_provider === "demo_scenario" || v.is_simulated) return null;

  const stage = String(v.maturity_stage ?? "uncertain");
  const ripeness: AnalysisResult["ripeness"] =
    stage === "red" ? "ripe" : stage === "turning" ? "turning" : stage === "green" ? "unripe" : stage === "not_applicable" ? "not_applicable" : "unknown";
  const sym = String(v.detected_leaf_symptoms ?? "").toLowerCase();
  const cropCondition: CropCondition =
    !sym || sym === "none" || sym.includes("healthy") || sym.includes("no visible")
      ? "healthy"
      : /(spot|blight|lesion|mold|mildew|wilt|rot|disease|necro|mosaic)/.test(sym)
        ? "disease"
        : "attention";
  const env = rateEnvironment(reading, t);
  const conf = String(v.visual_confidence ?? "none");
  const symptoms = [v.detected_leaf_color, v.detected_leaf_symptoms, v.leaf_condition_summary].filter(
    (x): x is string => typeof x === "string" && x.length > 0 && x.toLowerCase() !== "none",
  );
  return {
    id: j.analysis_id ?? `ai-${Date.now().toString(36)}`,
    createdAt: Date.now(),
    source: "ai",
    provider: String(v.ai_provider),
    imageName: file.name,
    cropCondition,
    ripeness,
    confidence: conf === "none" ? null : { label: `${conf[0].toUpperCase()}${conf.slice(1)} (model self-reported)`, value: CONF_MAP[conf] ?? null },
    symptoms: symptoms.length ? symptoms : ["No visible symptoms reported by the model"],
    summary: String(v.ai_multimodal_synthesis || v.stage_label || "Analysis complete."),
    suggestions: [
      ...(j.harvest?.next_action ? [String(j.harvest.next_action)] : []),
      ...(j.watering?.next_action ? [String(j.watering.next_action)] : []),
      ...suggestionsFor(cropCondition, ripeness, env.rating).slice(0, 2),
    ],
    environment: env.rating,
    environmentNotes: env.notes,
  };
}
