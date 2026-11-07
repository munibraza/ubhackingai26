import pytest
from backend.models import (
    VisualObservation,
    SensorReading,
    WeatherSummary,
)
from backend.services.decision_engine import DecisionEngine


@pytest.fixture
def base_sensor():
    return SensorReading(
        source="metro328_simulated",
        data_mode="simulated",
        air_temperature_c=24.2,
        air_relative_humidity_pct=60.0,
        ultrasonic_distance_cm=33.0,
        canopy_height_proxy_cm=17.0
    )


@pytest.fixture
def base_weather():
    return WeatherSummary(
        location_name="Buffalo, NY",
        latitude=42.8864,
        longitude=-78.8784,
        temperature_c=18.0,
        relative_humidity_pct=55.0,
        rain_last_24h_mm=0.5,
        rain_next_24h_mm=0.0
    )


def test_harvest_red_scenario(base_sensor, base_weather):
    visual = VisualObservation(
        maturity_stage="red",
        stage_label="Red / Ripe",
        is_simulated=True
    )
    res = DecisionEngine.evaluate(
        crop="tomato",
        variety="Roma",
        harvest_goal="eat_now",
        soil_condition="moist",
        leaf_symptoms="none",
        visual=visual,
        sensors=base_sensor,
        weather=base_weather
    )
    harvest = res["harvest"]
    assert harvest.status == "likely_ready"
    assert "mature-red" in harvest.recommendation.lower()
    # Check that evidence has SIMULATED tag and NOT_MEASURED tag
    evidence_types = [e.type for e in harvest.evidence]
    assert "SIMULATED" in evidence_types
    assert "NOT_MEASURED" in evidence_types
    assert len(harvest.references) > 0


def test_harvest_turning_scenario(base_sensor, base_weather):
    visual = VisualObservation(
        maturity_stage="turning",
        stage_label="Turning",
        is_simulated=True
    )
    res = DecisionEngine.evaluate(
        crop="tomato",
        variety=None,
        harvest_goal="store_transport",
        soil_condition="moist",
        leaf_symptoms="none",
        visual=visual,
        sensors=base_sensor,
        weather=base_weather
    )
    harvest = res["harvest"]
    assert harvest.status == "approaching_harvest"
    assert "breaker" in harvest.recommendation.lower() or "break" in harvest.recommendation.lower()


def test_harvest_green_scenario(base_sensor, base_weather):
    visual = VisualObservation(
        maturity_stage="green",
        stage_label="Green",
        is_simulated=True
    )
    res = DecisionEngine.evaluate(
        crop="tomato",
        variety=None,
        harvest_goal="eat_now",
        soil_condition="moist",
        leaf_symptoms="none",
        visual=visual,
        sensors=base_sensor,
        weather=base_weather
    )
    harvest = res["harvest"]
    assert harvest.status == "inspect_maturity"
    assert "green" in harvest.recommendation.lower()


def test_harvest_unavailable_scenario(base_sensor, base_weather):
    visual = VisualObservation(
        maturity_stage="unavailable",
        stage_label="Unavailable",
        is_simulated=False
    )
    res = DecisionEngine.evaluate(
        crop="tomato",
        variety=None,
        harvest_goal="eat_now",
        soil_condition="moist",
        leaf_symptoms="none",
        visual=visual,
        sensors=base_sensor,
        weather=base_weather
    )
    harvest = res["harvest"]
    assert harvest.status == "insufficient_evidence"


@pytest.mark.parametrize("soil_input,expected_status", [
    ("dry_at_5cm", "check_and_likely_water"),
    ("moist", "monitor_conditions"),
    ("wet", "avoid_watering"),
    ("unknown", "check_soil_before_deciding"),
])
def test_all_soil_conditions(soil_input, expected_status, base_sensor, base_weather):
    visual = VisualObservation(maturity_stage="red", is_simulated=True)
    res = DecisionEngine.evaluate(
        crop="tomato",
        variety=None,
        harvest_goal="eat_now",
        soil_condition=soil_input,
        leaf_symptoms="none",
        visual=visual,
        sensors=base_sensor,
        weather=base_weather
    )
    watering = res["watering"]
    assert watering.status == expected_status
    # Verify air relative humidity is NOT claimed to be soil moisture
    limitations_text = " ".join(watering.limitations).lower()
    assert "soil moisture" in limitations_text


def test_fertilizer_insufficient_evidence_without_symptoms(base_sensor, base_weather):
    visual = VisualObservation(maturity_stage="red", is_simulated=True)
    res = DecisionEngine.evaluate(
        crop="tomato",
        variety=None,
        harvest_goal="eat_now",
        soil_condition="moist",
        leaf_symptoms="none",
        visual=visual,
        sensors=base_sensor,
        weather=base_weather
    )
    fertilizer = res["fertilizer"]
    assert fertilizer.status == "insufficient_evidence"
    # Never prescribe specific NPK without soil test
    assert "NOT_MEASURED" in [e.type for e in fertilizer.evidence]
    recom_text = fertilizer.recommendation.lower()
    assert "do not apply fertilizer arbitrarily" in recom_text


@pytest.mark.parametrize("symptom", ["yellowing", "browning_spots", "wilting"])
def test_fertilizer_symptom_warnings(symptom, base_sensor, base_weather):
    visual = VisualObservation(maturity_stage="red", is_simulated=True)
    res = DecisionEngine.evaluate(
        crop="tomato",
        variety=None,
        harvest_goal="eat_now",
        soil_condition="moist",
        leaf_symptoms=symptom,
        visual=visual,
        sensors=base_sensor,
        weather=base_weather
    )
    fertilizer = res["fertilizer"]
    assert fertilizer.status == "investigate_stress"
    assert len(fertilizer.references) > 0
