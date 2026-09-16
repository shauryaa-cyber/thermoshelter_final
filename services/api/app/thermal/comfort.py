import numpy as np
import pandas as pd
from pydantic import BaseModel, Field


class ComfortMetrics(BaseModel):
    comfort_hours_percentage: float = Field(..., ge=0.0, le=100.0)
    total_heating_kwh: float = Field(..., ge=0.0)
    min_temp_reached: float
    max_temp_reached: float


def calculate_comfort_metrics(
    temperatures: pd.Series,
    t_outdoor: pd.Series,
    u_envelope: float,
    total_envelope_area: float,
    ventilation_loss_func,
    t_min_comfort: float = 18.0,
    t_max_comfort: float = 26.0,
) -> ComfortMetrics:
    # 1. Comfort Hours Calculation
    in_comfort_zone = (temperatures >= t_min_comfort) & (temperatures <= t_max_comfort)
    comfort_pct = (in_comfort_zone.sum() / len(temperatures)) * 100.0

    # 2. Supplemental Heating Load (kW)
    # Estimate power required to hold temperature at t_min_comfort when below threshold
    heating_power_watts = np.zeros(len(temperatures))

    for i in range(len(temperatures)):
        t_in = temperatures.iloc[i]
        if t_in < t_min_comfort:
            t_out = t_outdoor.iloc[i]
            # UA delta
            q_cond = u_envelope * total_envelope_area * (t_min_comfort - t_out)
            q_vent = ventilation_loss_func(t_min_comfort, t_out)
            heating_power_watts[i] = max(0.0, q_cond + q_vent)

    # 1-hour time steps in kWh (Watts / 1000 * 1 hour)
    total_heating_kwh = float(heating_power_watts.sum() / 1000.0)

    return ComfortMetrics(
        comfort_hours_percentage=float(comfort_pct),
        total_heating_kwh=total_heating_kwh,
        min_temp_reached=float(temperatures.min()),
        max_temp_reached=float(temperatures.max()),
    )