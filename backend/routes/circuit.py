from fastapi import APIRouter, HTTPException
from services.circuit_service import CircuitService
from schemas.circuit import CircuitPath
import logging

router = APIRouter(prefix="/api/v1/circuit", tags=["circuit"])
logger = logging.getLogger(__name__)

@router.get("/map", response_model=CircuitPath)
async def get_circuit_map(year: int, gp: str):
    try:
        path = CircuitService.get_circuit_path(year, gp)
        return path
    except Exception as e:
        logger.error(f"Error fetching circuit map: {e}")
        raise HTTPException(status_code=500, detail=str(e))
