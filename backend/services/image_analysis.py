import os
import json
import base64
from typing import Optional
from dotenv import load_dotenv
from fastapi import UploadFile, HTTPException
from backend.models import VisualObservation

# Load environment variables
load_dotenv()

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/octet-stream"
}


class ImageAnalysisService:
    @classmethod
    async def process_upload(
        cls,
        file: Optional[UploadFile],
        demo_scenario: Optional[str] = None,
        custom_api_key: Optional[str] = None
    ) -> VisualObservation:
        photo_uploaded = False
        filename = None
        file_size_kb = None
        content_type = None
        file_bytes = None

        if file and file.filename:
            # Validate content type
            if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES and not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.heic')):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file format '{file.content_type}'. Please upload JPEG, PNG, or HEIC."
                )

            # Read file length
            file_bytes = await file.read()
            size_bytes = len(file_bytes)
            if size_bytes > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail=f"File size ({round(size_bytes / (1024*1024), 1)} MB) exceeds maximum limit of 15 MB."
                )

            photo_uploaded = True
            filename = file.filename
            file_size_kb = round(size_bytes / 1024.0, 1)
            content_type = file.content_type or "image/jpeg"

        # Check for Gemini API Key (either custom passed in or from environment)
        api_key = custom_api_key or os.getenv("GEMINI_API_KEY")

        # 1. If user uploaded a photo and Gemini API key is provided, run real Gemini Vision!
        if photo_uploaded and file_bytes and api_key and (demo_scenario is None or demo_scenario == "auto" or demo_scenario == ""):
            gemini_result = await cls._analyze_with_gemini(file_bytes, content_type, api_key, filename)
            if gemini_result:
                return gemini_result

        # 2. Otherwise, check if user chose a manual Demo Scenario
        scenario = (demo_scenario or "").strip().lower()
        if scenario == "red":
            return VisualObservation(
                photo_uploaded=photo_uploaded,
                filename=filename,
                file_size_kb=file_size_kb,
                content_type=content_type,
                maturity_stage="red",
                stage_label="Red / Ripe (Simulated Demonstration Scenario)",
                visual_confidence="high",
                is_simulated=True,
                ai_provider="demo_scenario",
                observation_notes="Observation supplied by selected demo scenario 'Red tomato'. Not inferred from uploaded photo pixels."
            )
        elif scenario == "turning":
            return VisualObservation(
                photo_uploaded=photo_uploaded,
                filename=filename,
                file_size_kb=file_size_kb,
                content_type=content_type,
                maturity_stage="turning",
                stage_label="Turning / Breaker (Simulated Demonstration Scenario)",
                visual_confidence="medium",
                is_simulated=True,
                ai_provider="demo_scenario",
                observation_notes="Observation supplied by selected demo scenario 'Turning tomato'. Not inferred from uploaded photo pixels."
            )
        elif scenario == "green":
            return VisualObservation(
                photo_uploaded=photo_uploaded,
                filename=filename,
                file_size_kb=file_size_kb,
                content_type=content_type,
                maturity_stage="green",
                stage_label="Green / Immature (Simulated Demonstration Scenario)",
                visual_confidence="medium",
                is_simulated=True,
                ai_provider="demo_scenario",
                observation_notes="Observation supplied by selected demo scenario 'Green tomato'. Not inferred from uploaded photo pixels."
            )
        elif scenario == "uncertain":
            return VisualObservation(
                photo_uploaded=photo_uploaded,
                filename=filename,
                file_size_kb=file_size_kb,
                content_type=content_type,
                maturity_stage="uncertain",
                stage_label="Uncertain / Ambiguous (Simulated Demonstration Scenario)",
                visual_confidence="low",
                is_simulated=True,
                ai_provider="demo_scenario",
                observation_notes="Simulated low-confidence scenario representing visual obstruction, glare, or atypical cultivar."
            )
        else:
            # Honest fallback when no demo scenario is active and no Gemini key
            notes = (
                "Photo received. Connect a Gemini API Key in the UI/backend to enable real-time multimodal AI analysis, "
                "or select a Demo Scenario above to test deterministic agronomic rules."
                if photo_uploaded else
                "No photo uploaded. Select a Demo Scenario above to evaluate downstream agronomic rules."
            )
            return VisualObservation(
                photo_uploaded=photo_uploaded,
                filename=filename,
                file_size_kb=file_size_kb,
                content_type=content_type,
                maturity_stage="unavailable",
                stage_label="Visual analysis unavailable",
                visual_confidence="none",
                is_simulated=False,
                ai_provider=None,
                observation_notes=notes
            )

    @classmethod
    async def _analyze_with_gemini(
        cls,
        image_bytes: bytes,
        mime_type: str,
        api_key: str,
        filename: Optional[str]
    ) -> Optional[VisualObservation]:
        """
        Calls Gemini 2.5 Flash multimodal vision API to extract plant type,
        fruit ripeness stage, and visible leaf stress symptoms.
        """
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)

            prompt = """
You are an expert agronomic computer vision specialist.
Analyze this plant photo for the FolLand AI smart agriculture platform.

Return a STRICT JSON object with the following fields:
{
  "plant_identified": "<identified plant or crop name, e.g. Tomato, Indoor Ficus, Pine, Succulent, etc.>",
  "is_tomato_or_fruit": <true or false>,
  "maturity_stage": "<one of: 'red', 'turning', 'green', 'uncertain', 'not_applicable'>",
  "stage_label": "<short descriptive title, e.g. 'Red / Ripe Fruit Detected' or 'Vegetative Foliage'>",
  "leaf_symptoms": "<one of: 'none', 'yellowing', 'browning_spots', 'wilting'>",
  "visual_confidence": "<one of: 'high', 'medium', 'low'>",
  "detailed_description": "<concise 1-2 sentence description of visible colors, textures, and anomalies without hallucinating unseen traits>"
}

Scientific guardrail rules:
1. If fruit is predominantly red/orange-red: maturity_stage = 'red'.
2. If fruit shows pink/orange breaker blush: maturity_stage = 'turning'.
3. If fruit is fully green: maturity_stage = 'green'.
4. If image is foliage only or non-fruiting plant: maturity_stage = 'not_applicable'.
5. If image is blurry, occluded, or ambiguous: maturity_stage = 'uncertain' and confidence = 'low'.
6. Do NOT claim elemental soil nutrient values (N, P, K) or soil moisture percentage.
"""

            # Standardize mime_type
            if "heic" in mime_type.lower() or (filename and filename.lower().endswith(".heic")):
                effective_mime = "image/jpeg"
            else:
                effective_mime = mime_type if mime_type.startswith("image/") else "image/jpeg"

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=effective_mime,
                    ),
                    prompt,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )

            if response and response.text:
                parsed = json.loads(response.text)
                stage_raw = parsed.get("maturity_stage", "uncertain").lower()
                if stage_raw not in ["red", "turning", "green", "uncertain"]:
                    # Non-tomato or foliage-only
                    stage = "uncertain"
                else:
                    stage = stage_raw

                confidence_raw = parsed.get("visual_confidence", "medium").lower()
                confidence = confidence_raw if confidence_raw in ["high", "medium", "low"] else "medium"

                return VisualObservation(
                    photo_uploaded=True,
                    filename=filename,
                    file_size_kb=round(len(image_bytes) / 1024.0, 1),
                    content_type=mime_type,
                    maturity_stage=stage,
                    stage_label=f"Gemini Vision: {parsed.get('stage_label', parsed.get('plant_identified', 'Analyzed'))}",
                    visual_confidence=confidence,
                    is_simulated=False,
                    ai_provider="gemini-2.5-flash",
                    detected_plant=parsed.get("plant_identified"),
                    detected_leaf_symptoms=parsed.get("leaf_symptoms"),
                    observation_notes=parsed.get("detailed_description", "Analyzed via Gemini 2.5 Flash Multimodal Vision.")
                )
        except Exception as e:
            print(f"Gemini Vision API call error: {e}")
            return None
