from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pipelines.lap_penalty_predictor import LapPenaltyPredictor
from pipelines.intercept_engine import InterceptEngine
from schemas.prediction import LapPenalty, InterceptStatus
from schemas.telemetry import TelemetryPoint
from schemas.circuit import CircuitCoordinate
import logging

router = APIRouter(prefix="/api/v1/prediction", tags=["prediction"])
logger = logging.getLogger(__name__)

class PredictRequest(BaseModel):
    features: dict

class InterceptRequest(BaseModel):
    cognitive_load: float
    telemetry_point: TelemetryPoint
    circuit_point: CircuitCoordinate

@router.post("/lap-penalty", response_model=LapPenalty)
async def predict_lap_penalty(req: PredictRequest):
    try:
        predictor = LapPenaltyPredictor.get_instance()
        return predictor.predict(req.features)
    except Exception as e:
        logger.error(f"Error predicting lap penalty: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/intercept", response_model=InterceptStatus)
async def evaluate_intercept(req: InterceptRequest):
    try:
        return InterceptEngine.evaluate(
            cognitive_load=req.cognitive_load,
            telemetry_point=req.telemetry_point,
            circuit_point=req.circuit_point
        )
    except Exception as e:
        logger.error(f"Error evaluating intercept: {e}")
        raise HTTPException(status_code=500, detail=str(e))
