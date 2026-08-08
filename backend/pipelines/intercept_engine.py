from datetime import datetime
from schemas.telemetry import TelemetryPoint
from schemas.circuit import CircuitCoordinate
from schemas.prediction import InterceptStatus
from config import settings

class InterceptEngine:
    @staticmethod
    def evaluate(
        cognitive_load: float,
        telemetry_point: TelemetryPoint,
        circuit_point: CircuitCoordinate
    ) -> InterceptStatus:
        """
        Evaluate whether the Active Intercept should trigger.
        
        Conditions (ALL must be true):
        1. CL > 80
        2. Driver is in or approaching a heavy braking zone
        3. Speed > 200 km/h (high-energy approach)
        """
        cl_exceeded = cognitive_load > settings.intercept_cl_threshold
        in_braking_zone = circuit_point.is_heavy_braking
        high_speed = telemetry_point.speed > 200
        
        should_intercept = cl_exceeded and in_braking_zone and high_speed
        
        return InterceptStatus(
            active=should_intercept,
            cognitive_load=round(cognitive_load, 1),
            speed=telemetry_point.speed,
            sector=circuit_point.sector,
            message=(
                f"CHANNEL LOCKED: HIGH COGNITIVE LOAD ({cognitive_load:.0f}%) "
                f"/ CRITICAL TRACK SECTOR S{circuit_point.sector}"
            ) if should_intercept else None,
            triggered_at=datetime.utcnow() if should_intercept else None,
        )
