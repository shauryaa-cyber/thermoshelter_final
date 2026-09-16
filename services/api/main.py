from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import math
import os

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",")
    if origin.strip()
]
app = FastAPI(title="THERMOSHELTER API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SideAperture(BaseModel):
    hasDoor: bool = False
    windowCount: int = 0


class ShelterConfig(BaseModel):
    length: float = 6.0
    width: float = 4.0
    height: float = 2.8
    orientation: float = 0.0  # degrees offset from True South (0° = True South)
    wall_insulation_thickness: float = 0.15
    window_area: Optional[float] = None
    target_temp_min: float = 18.0
    target_temp_max: float = 26.0
    apertures: Optional[Dict[str, SideAperture]] = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "thermoshelter-api"}


@app.post("/api/v1/simulate")
def simulate_thermal_performance(config: ShelterConfig):
    # Calculate orientation solar gain multiplier
    # True South (0°) yields 100% solar efficiency (1.0). Rotating away reduces South solar efficiency.
    orientation_rad = math.radians(abs(config.orientation))
    orientation_solar_factor = max(0.2, math.cos(orientation_rad))

    # Calculate aperture areas and effective solar gains
    total_doors = 0
    total_windows = 0
    south_windows = 0

    if config.apertures:
        for side, spec in config.apertures.items():
            if spec.hasDoor:
                total_doors += 1
            total_windows += spec.windowCount
            if side == "south":
                south_windows = spec.windowCount

    calculated_window_area = total_windows * 1.2
    calculated_door_area = total_doors * 2.0
    window_area = calculated_window_area if config.apertures else (config.window_area or 4.0)

    # South glazing efficiency scaled by orientation angle
    solar_heat_gain_kw = (south_windows * 3.5 * orientation_solar_factor) + ((total_windows - south_windows) * 0.8)

    volume = config.length * config.width * config.height
    surface_area = 2 * (config.length * config.height + config.width * config.height)

    # Conduction heat loss calculations
    u_wall = 0.04 / (config.wall_insulation_thickness + 0.01)
    heat_loss_walls = round(max(0, surface_area - window_area - calculated_door_area) * u_wall * 15.0, 2)
    heat_loss_windows = round(window_area * 1.4 * 20.0, 2)
    heat_loss_doors = round(calculated_door_area * 2.0 * 20.0, 2)

    # Calculate metrics with orientation influence
    base_heating = 180 - (config.wall_insulation_thickness * 220) + (total_doors * 12)
    total_heating_demand = max(5, int(base_heating - (solar_heat_gain_kw * 14)))

    comfort_hours = min(100, max(10, int(50 + (config.wall_insulation_thickness * 130) + (solar_heat_gain_kw * 6) - (total_doors * 4))))

    # 24-hour temperature curve calculation
    hourly_temperatures = []
    base_outdoor = -12.0
    for hour in range(24):
        t_outdoor = round(base_outdoor + 5 * (1 if 10 <= hour <= 16 else -0.5), 1)
        solar_boost = (solar_heat_gain_kw * 0.6) if 10 <= hour <= 16 else -0.2
        t_indoor = round(13.0 + (config.wall_insulation_thickness * 28) + solar_boost - (total_doors * 0.3), 1)
        hourly_temperatures.append({
            "hour": hour,
            "t_outdoor": t_outdoor,
            "t_indoor": t_indoor
        })

    return {
        "comfort_hours_pct": comfort_hours,
        "total_heating_demand_kwh": total_heating_demand,
        "temp_min_c": round(10.0 + (config.wall_insulation_thickness * 32) - (total_doors * 1.2), 1),
        "temp_max_c": round(18.0 + (solar_heat_gain_kw * 1.5), 1),
        "hourly_temperatures": hourly_temperatures,
        "heat_loss_breakout": {
            "walls": heat_loss_walls,
            "roof": round(heat_loss_walls * 0.35, 2),
            "floor": round(heat_loss_walls * 0.2, 2),
            "windows": heat_loss_windows,
            "doors": heat_loss_doors,
            "ventilation": round(volume * 0.33 * 15.0, 2),
        }
    }