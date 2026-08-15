from fastapi import APIRouter, HTTPException
from typing import List
from services.telemetry_service import TelemetryService
from schemas.telemetry import LapData, TelemetryStream
import logging

router = APIRouter(prefix="/api/v1/telemetry", tags=["telemetry"])
logger = logging.getLogger(__name__)

@router.get("/laps", response_model=List[LapData])
def get_driver_laps(year: int, gp: str, driver: str):
    try:
        laps = TelemetryService.get_laps(year, gp, driver)
        return laps
    except Exception as e:
        logger.error(f"Error fetching laps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream", response_model=TelemetryStream)
def get_driver_telemetry(year: int, gp: str, driver: str, session: str = "Race", lap_number: int = 1):
    try:
        stream = TelemetryService.get_telemetry_stream(year, gp, driver, lap_number)
        return stream
    except Exception as e:
        logger.error(f"Error fetching telemetry stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))
