import numpy as np
import pandas as pd
import pvlib
from pydantic import BaseModel, Field


class SolarSurfaceParams(BaseModel):
    area: float = Field(..., gt=0, description="Surface area in m²")
    tilt: float = Field(..., ge=0, le=180, description="Surface tilt from horizontal (0=flat, 90=vertical)")
    azimuth: float = Field(..., ge=0, lt=360, description="Surface azimuth in degrees (180=South)")
    shgc: float = Field(default=0.7, ge=0, le=1, description="Solar Heat Gain Coefficient for glazing")
    absorptance: float = Field(default=0.6, ge=0, le=1, description="Surface solar absorptance for opaque wall")


def calculate_solar_gains(
    surface: SolarSurfaceParams,
    latitude: float,
    longitude: float,
    times: pd.DatetimeIndex,
    dni: pd.Series,
    ghi: pd.Series,
    dhi: pd.Series,
    is_glazing: bool = False,
) -> pd.Series:
    # 1. Solar Position Calculation
    solpos = pvlib.solarposition.get_solarposition(times, latitude, longitude)
    
    # 2. Angle of Incidence
    aoi = pvlib.irradiance.aoi(
        surface.tilt,
        surface.azimuth,
        solpos["apparent_zenith"],
        solpos["azimuth"],
    )
    
    # 3. Total Incident Irradiance on Tilted Surface
    total_irrad = pvlib.irradiance.get_total_irradiance(
        surface_tilt=surface.tilt,
        surface_azimuth=surface.azimuth,
        solar_zenith=solpos["apparent_zenith"],
        solar_azimuth=solpos["azimuth"],
        dni=dni,
        ghi=ghi,
        dhi=dhi,
    )
    
    i_surface = total_irrad["poa_global"].clip(lower=0.0)

    # 4. Solar Gain Calculation (W)
    if is_glazing:
        q_solar = surface.area * surface.shgc * i_surface
    else:
        q_solar = surface.absorptance * surface.area * i_surface

    return q_solar