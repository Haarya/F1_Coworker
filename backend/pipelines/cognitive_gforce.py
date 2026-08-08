import math
from typing import List
from schemas.telemetry import TelemetryPoint
from config import settings

def compute_lateral_g(telemetry_points: List[TelemetryPoint], window_size: int = 5) -> List[float]:
    """
    Compute lateral G-force at each telemetry point using 
    path curvature derived from (X, Y) coordinates.
    """
    if len(telemetry_points) < 3:
        return [0.0] * len(telemetry_points)

    g_lat_values = [0.0]  # First point has no curvature
    
    for i in range(1, len(telemetry_points) - 1):
        # Get windowed neighbors
        i_start = max(0, i - window_size // 2)
        i_end = min(len(telemetry_points), i + window_size // 2 + 1)
        
        p1 = telemetry_points[i_start]
        p2 = telemetry_points[i]
        p3 = telemetry_points[i_end - 1]
        
        # Triangle area (Shoelace formula)
        area = abs(
            p1.x * (p2.y - p3.y) +
            p2.x * (p3.y - p1.y) +
            p3.x * (p1.y - p2.y)
        ) / 2.0
        
        # Side lengths
        d12 = math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)
        d23 = math.sqrt((p3.x - p2.x)**2 + (p3.y - p2.y)**2)
        d13 = math.sqrt((p3.x - p1.x)**2 + (p3.y - p1.y)**2)
        
        denom = d12 * d23 * d13
        kappa = (2.0 * area / denom) if denom > 1e-6 else 0.0
        
        # Convert speed km/h → m/s
        v = p2.speed / 3.6
        
        # G_lat = v² · κ / g
        g_lat = (v ** 2 * kappa) / 9.81
        g_lat_values.append(round(g_lat, 3))
    
    g_lat_values.append(0.0)  # Last point
    return g_lat_values

def compute_psychological_frustration(raw_cl: float, g_lat: float, alpha: float = None) -> float:
    """
    Separate psychological frustration from physical G-force strain.
    S_psych = max(0, S_raw - α · G_lat)
    """
    if alpha is None:
        alpha = settings.gforce_alpha
    
    # Scale G to CL range (Assuming ~5G max = ~100 CL penalty equivalent if alpha=1)
    s_psych = max(0.0, raw_cl - alpha * g_lat * 20)  
    return round(s_psych, 1)
