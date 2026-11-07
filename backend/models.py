from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class SensorReading(BaseModel):
    source: str = "metro328_simulated"
    data_mode: Literal["simulated", "live", "unavailable"] = "simulated"
    received_at_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    fresh: bool = True
    air_temperature_c: Optional[float] = 23.8
    air_relative_humidity_pct: Optional[float] = 62.5
    ultrasonic_distance_cm: Optional[float] = 34.2
    canopy_height_proxy_cm: Optional[float] = 15.8
    status: str = "ok"
    notes: Optional[str] = "Simulated readings from Adafruit METRO 328 mock profile"


class WeatherSummary(BaseModel):
    location_name: str = "Buffalo, NY"
    latitude: float = 42.8864
    longitude: float = -78.8784
    temperature_c: Optional[float] = 18.5
    relative_humidity_pct: Optional[float] = 58.0
    rain_last_24h_mm: Optional[float] = 1.2
    rain_next_24h_mm: Optional[float] = 0.4
    precipitation_sum_7d_mm: Optional[float] = 6.8
    weather_description: Optional[str] = "Partly cloudy"
    source: str = "open-meteo"
    retrieved_at_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_fallback: bool = False


class VisualObservation(BaseModel):
    photo_uploaded: bool = False
    filename: Optional[str] = None
    file_size_kb: Optional[float] = None
    content_type: Optional[str] = None
    maturity_stage: Optional[str] = "unavailable"  # "green" | "turning" | "red" | "uncertain" | "unavailable"
    stage_label: str = "Visual analysis unavailable"
    visual_confidence: Literal["high", "medium", "low", "none"] = "none"
    is_simulated: bool = True
    observation_notes: str = "No automated AI inference claim made; observation determined by demo scenario selection."


class EvidenceItem(BaseModel):
    type: Literal["SIMULATED", "USER_REPORTED", "WEATHER_FORECAST", "NOT_MEASURED", "OBSERVED"]
    label: str
    detail: str


class ReferenceItem(BaseModel):
    id: str
    title: str
    organization: str
    url: str
    relevance: str


class RecommendationCard(BaseModel):
    category: Literal["harvest", "watering", "fertilizer"]
    status: str
    title: str
    recommendation: str
    evidence: List[EvidenceItem]
    limitations: List[str]
    next_action: str
    references: List[ReferenceItem]


class AnalysisResponse(BaseModel):
    analysis_id: str
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    crop: str = "tomato"
    variety: Optional[str] = None
    harvest_goal: str = "eat_now"
    soil_condition: str = "unknown"
    leaf_symptoms: Optional[str] = "none"
    visual_observations: VisualObservation
    sensor_data: SensorReading
    weather_data: WeatherSummary
    harvest: RecommendationCard
    watering: RecommendationCard
    fertilizer: RecommendationCard
    scientific_summary: str
