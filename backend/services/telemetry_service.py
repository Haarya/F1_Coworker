import fastf1
import pandas as pd
from typing import List, Optional
from config import settings
from schemas.telemetry import LapData, TelemetryPoint, TelemetryStream
import os

class TelemetryService:
    @classmethod
    def enable_cache(cls):
        cache_dir = str(settings.fastf1_cache_dir)
        os.makedirs(cache_dir, exist_ok=True)
        fastf1.Cache.enable_cache(cache_dir)
        
    @classmethod
    def get_session(cls, year: int, gp: str, session_type: str = 'R'):
        cls.enable_cache()
        session = fastf1.get_session(year, gp, session_type)
        session.load(telemetry=True, laps=True, weather=False)
        return session

    @classmethod
    def get_laps(cls, year: int, gp: str, driver: str) -> List[LapData]:
        session = cls.get_session(year, gp)
        laps = session.laps.pick_driver(driver)
        
        result = []
        for _, lap in laps.iterrows():
            if pd.isna(lap['LapTime']):
                continue
            
            result.append(LapData(
                driver=driver,
                lap_number=int(lap['LapNumber']),
                lap_time=lap['LapTime'].total_seconds(),
                sector_1=lap['Sector1Time'].total_seconds() if not pd.isna(lap['Sector1Time']) else None,
                sector_2=lap['Sector2Time'].total_seconds() if not pd.isna(lap['Sector2Time']) else None,
                sector_3=lap['Sector3Time'].total_seconds() if not pd.isna(lap['Sector3Time']) else None
            ))
        return result

    @classmethod
    def get_telemetry_stream(cls, year: int, gp: str, driver: str, lap_number: int) -> TelemetryStream:
        session = cls.get_session(year, gp)
        laps = session.laps.pick_driver(driver)
        lap = laps[laps['LapNumber'] == lap_number].iloc[0]
        
        try:
            telemetry = lap.get_telemetry()
        except KeyError:
            # Fallback if position data (X, Y) is unavailable for this session (e.g., 2018 Australia)
            telemetry = lap.get_car_data()
            telemetry['X'] = 0.0
            telemetry['Y'] = 0.0
        
        points = []
        for _, row in telemetry.iterrows():
            points.append(TelemetryPoint(
                time=row['Time'].total_seconds() if hasattr(row['Time'], 'total_seconds') else 0.0,
                speed=float(row['Speed']),
                throttle=float(row['Throttle']),
                brake=float(row['Brake']),
                rpm=float(row['RPM']),
                x=float(row['X']),
                y=float(row['Y']),
                gear=int(row['nGear'])
            ))
            
        return TelemetryStream(
            driver=driver,
            lap_number=lap_number,
            data=points
        )
