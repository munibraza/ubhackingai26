import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.models import (
    SensorReading,
    WeatherSummary,
    AnalysisResponse,
)
from backend.services.sensor_service import SensorService
from backend.services.weather_service import WeatherService
from backend.services.image_analysis import ImageAnalysisService
from backend.services.decision_engine import DecisionEngine

app = FastAPI(
    title="FolLand AI API",
    description="Multimodal Smart Agriculture Decision Support Assistant API",
    version="1.0.0"
)

# Allow CORS for development and mobile network testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "FolLand AI",
        "version": "1.0.0",
        "sensor_mode": "simulated",
        "supported_crops": ["tomato"],
        "hardware_target": "Adafruit METRO 328 (CP2104 USB-Serial)"
    }


@app.get("/api/sensors/latest", response_model=SensorReading)
async def get_latest_sensors(disconnected: bool = Query(False, description="Simulate disconnected sensor")):
    return SensorService.get_latest_reading(simulate_disconnected=disconnected)


@app.get("/api/weather", response_model=WeatherSummary)
async def get_weather(
    latitude: Optional[float] = Query(None, description="Latitude"),
    longitude: Optional[float] = Query(None, description="Longitude"),
    location_name: Optional[str] = Query(None, description="Name of location")
):
    return await WeatherService.get_weather(
        latitude=latitude,
        longitude=longitude,
        location_name=location_name
    )


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_plant(
    image: Optional[UploadFile] = File(None),
    crop: str = Form("tomato"),
    variety: Optional[str] = Form(None),
    harvest_goal: str = Form("eat_now"),
    soil_condition: str = Form("unknown"),
    leaf_symptoms: Optional[str] = Form("none"),
    demo_scenario: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    gemini_api_key: Optional[str] = Form(None)
):
    # 1. Get latest sensor telemetry (simulated or live hardware feed)
    sensor_data = SensorService.get_latest_reading()

    # 2. Get local weather information
    weather_data = await WeatherService.get_weather(
        latitude=latitude,
        longitude=longitude
    )

    # 3. Process visual upload + full multimodal telemetry fusion with Gemini Vision
    visual_obs = await ImageAnalysisService.process_upload(
        file=image,
        demo_scenario=demo_scenario,
        custom_api_key=gemini_api_key,
        sensor_data=sensor_data,
        weather_data=weather_data,
        soil_condition=soil_condition,
        crop=crop
    )

    # If Gemini analyzed the image, its automated foliage detection takes precedence over manual user selection
    effective_leaf_symptoms = leaf_symptoms
    if visual_obs.ai_provider == "gemini-2.5-flash" and visual_obs.detected_leaf_symptoms:
        effective_leaf_symptoms = visual_obs.detected_leaf_symptoms
    elif (not leaf_symptoms or leaf_symptoms == "none") and visual_obs.detected_leaf_symptoms:
        effective_leaf_symptoms = visual_obs.detected_leaf_symptoms

    # If Gemini identified the plant, enrich variety or crop context if not set
    effective_variety = variety
    if not effective_variety and visual_obs.detected_plant:
        effective_variety = visual_obs.detected_plant

    # 4. Run deterministic decision engine
    decision_results = DecisionEngine.evaluate(
        crop=crop,
        variety=effective_variety,
        harvest_goal=harvest_goal,
        soil_condition=soil_condition,
        leaf_symptoms=effective_leaf_symptoms,
        visual=visual_obs,
        sensors=sensor_data,
        weather=weather_data
    )

    response = AnalysisResponse(
        analysis_id=f"folland-{uuid.uuid4().hex[:8]}",
        crop=crop,
        variety=variety,
        harvest_goal=harvest_goal,
        soil_condition=soil_condition,
        leaf_symptoms=leaf_symptoms,
        visual_observations=visual_obs,
        sensor_data=sensor_data,
        weather_data=weather_data,
        harvest=decision_results["harvest"],
        watering=decision_results["watering"],
        fertilizer=decision_results["fertilizer"],
        scientific_summary=decision_results["scientific_summary"]
    )

    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
