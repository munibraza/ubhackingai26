import {
  SensorReading,
  WeatherSummary,
  AnalysisResponse,
  HealthCheckResponse,
} from '../types';

export const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchLatestSensors(disconnected: boolean = false): Promise<SensorReading> {
  const url = `${API_BASE}/sensors/latest${disconnected ? '?disconnected=true' : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sensors: ${res.statusText}`);
  return res.json();
}

export async function fetchWeather(lat?: number, lon?: number, name?: string): Promise<WeatherSummary> {
  const params = new URLSearchParams();
  if (lat !== undefined) params.append('latitude', lat.toString());
  if (lon !== undefined) params.append('longitude', lon.toString());
  if (name) params.append('location_name', name);

  const url = `${API_BASE}/weather?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch weather: ${res.statusText}`);
  return res.json();
}

export async function submitPlantAnalysis(formData: FormData): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {
      // Fallback to status text
    }
    throw new Error(errorDetail);
  }

  return res.json();
}
