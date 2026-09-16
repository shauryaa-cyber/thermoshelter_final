import numpy as np
import pandas as pd
from pydantic import BaseModel, Field


class ThermalSimulationConfig(BaseModel):
    initial_temperature: float = Field(default=15.0, description="Initial indoor temperature (°C)")
    thermal_mass_capacitance: float = Field(default=2e6, gt=0.0, description="Effective thermal mass heat capacity (J/K)")
    internal_gains: float = Field(default=100.0, ge=0.0, description="Constant internal heat gains (W)")


def run_transient_simulation(
    config: ThermalSimulationConfig,
    times: pd.DatetimeIndex,
    t_outdoor: pd.Series,
    q_solar: pd.Series,
    u_envelope: float,
    total_envelope_area: float,
    ventilation_loss_func,
) -> pd.DataFrame:
    n_steps = len(times)
    temperatures = np.zeros(n_steps)
    q_conductions = np.zeros(n_steps)
    q_vents = np.zeros(n_steps)
    q_nets = np.zeros(n_steps)

    current_temp = config.initial_temperature
    dt = 3600.0  # 1-hour time step in seconds

    for i in range(n_steps):
        t_out = t_outdoor.iloc[i]
        q_sol = q_solar.iloc[i]

        # 1. Conduction heat loss (W)
        q_cond = u_envelope * total_envelope_area * (current_temp - t_out)

        # 2. Ventilation heat loss (W)
        q_vent = ventilation_loss_func(current_temp, t_out)

        # 3. Net energy balance (W)
        q_net = q_sol + config.internal_gains - (q_cond + q_vent)

        # 4. Temperature update
        dT = (q_net / config.thermal_mass_capacitance) * dt
        current_temp += dT

        temperatures[i] = current_temp
        q_conductions[i] = q_cond
        q_vents[i] = q_vent
        q_nets[i] = q_net

    return pd.DataFrame({
        "temperature": temperatures,
        "q_conduction": q_conductions,
        "q_ventilation": q_vents,
        "q_net": q_nets,
    }, index=times)