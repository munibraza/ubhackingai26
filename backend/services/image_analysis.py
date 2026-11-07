from typing import Optional
from fastapi import UploadFile, HTTPException
from backend.models import VisualObservation

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/octet-stream"  # Some Safari mobile uploads send octet-stream
}


class ImageAnalysisService:
    @staticmethod
    async def process_upload(
        file: Optional[UploadFile],
        demo_scenario: Optional[str] = None
    ) -> VisualObservation:
        photo_uploaded = False
        filename = None
        file_size_kb = None
        content_type = None

        if file and file.filename:
            # Validate content type
            if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES and not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.heic')):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file format '{file.content_type}'. Please upload JPEG, PNG, or HEIC."
                )

            # Read file length
            contents = await file.read()
            size_bytes = len(contents)
            if size_bytes > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail=f"File size ({round(size_bytes / (1024*1024), 1)} MB) exceeds maximum limit of 15 MB."
                )

            photo_uploaded = True
            filename = file.filename
            file_size_kb = round(size_bytes / 1024.0, 1)
            content_type = file.content_type

        # Handle demo scenario
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
                observation_notes="Simulated low-confidence scenario representing visual obstruction, glare, or atypical cultivar."
            )
        else:
            # Honest fallback when no demo scenario is active
            return VisualObservation(
                photo_uploaded=photo_uploaded,
                filename=filename,
                file_size_kb=file_size_kb,
                content_type=content_type,
                maturity_stage="unavailable",
                stage_label="Visual analysis unavailable",
                visual_confidence="none",
                is_simulated=False,
                observation_notes="Image received. Automated computer vision model is not yet connected in this MVP; select a Demo Scenario above to evaluate downstream agronomic rules."
            )
