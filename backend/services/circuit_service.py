import pandas as pd
import numpy as np
from services.telemetry_service import TelemetryService
from schemas.circuit import CircuitPath, CircuitCoordinate

class CircuitService:
    @classmethod
    def get_circuit_path(cls, year: int, gp: str) -> CircuitPath:
        # Load the session using TelemetryService caching logic
        session = TelemetryService.get_session(year, gp)
        
        # Pick the absolute fastest lap of the session to trace the racing line
        fastest_lap = session.laps.pick_fastest()
        telemetry = fastest_lap.get_telemetry()
        
        # Downsample telemetry for the frontend to prevent massive payloads (~300 points is enough)
        # Calculate step size based on length of telemetry
        target_points = 300
        step = max(1, len(telemetry) // target_points)
        
        downsampled = telemetry.iloc[::step]
        
        # Normalize X, Y to fit within a 0-1000 viewBox roughly for SVG drawing
        min_x, max_x = telemetry['X'].min(), telemetry['X'].max()
        min_y, max_y = telemetry['Y'].min(), telemetry['Y'].max()
        
        x_range = max_x - min_x
        y_range = max_y - min_y
        
        # Ensure symmetric scaling
        scale = 1000 / max(x_range, y_range)
        
        coords = []
        for _, row in downsampled.iterrows():
            # Heavy braking zones mapped roughly to Brake > 0.8
            is_braking = float(row['Brake']) > 0.8
            
            # Map sector logic based on FastF1's Sector column if available
            sector = 1
            if 'Sector' in row:
                sector = int(row['Sector'])
            
            # Translate and scale
            x_norm = (float(row['X']) - min_x) * scale
            y_norm = (float(row['Y']) - min_y) * scale
            
            coords.append(CircuitCoordinate(
                x=x_norm,
                y=y_norm,
                sector=sector,
                is_heavy_braking=is_braking
            ))
            
        return CircuitPath(
            circuit_name=gp,
            year=year,
            coordinates=coords
        )
