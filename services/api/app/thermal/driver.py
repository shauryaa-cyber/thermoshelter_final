from typing import Any, Dict
import pandas as pd
from app.thermal.envelope import BuildingAssembly


def run_thermal_simulation(
    weather_df: pd.DataFrame,
    assembly: BuildingAssembly,
    building_volume: float,  # m³
    thermal_mass_capacity: float,  # J/K (effective heat capacity C_total)
    ach: float = 0.5,  # Air changes per hour
    elevation: float = 3500.0,  # meters (default Leh altitude)
    t_initial: float = 15.0,  # Starting inside temperature °C
    t_setpoint: float = 18.0,  # Minimum comfort setpoint °C for heating demand
) -> Dict[str, Any]:
    """Runs hour-by-hour transient thermal simulation using real EPW climate data.

    Returns time-series DataFrames and aggregated comfort/energy metrics.
    """
    # Air properties adjusted for elevation
    # Air density estimation: rho ≈ 1.225 * exp(-elevation / 8500)
    import math

    air_density = 1.225 * math.exp(-elevation / 8500.0)
    cp_air = 1005.0  # J/(kg·K)
    vol_flow_rate = (ach * building_volume) / 3600.0  # m³/s
    ua_vent = air_density * cp_air * vol_flow_rate  # W/K

    ua_envelope = assembly.total_ua
    ua_total = ua_envelope + ua_vent  # Total building heat loss conductance (W/K)

    dt_seconds = 3600.0  # Hourly integration timestep
    t_inside = t_initial

    inside_temps = []
    heating_demands_kwh = []
    component_loss_series = {comp.name: [] for comp in assembly.components}

    for idx, row in weather_df.iterrows():
        t_out = row["temp_air"]
        # Standard horizontal irradiance fallback for simple heat gains if solar geometry is uncoupled
        ghi = row.get("ghi", 0.0)
        q_solar = ghi * 0.1 * (building_volume ** (2 / 3))  # Simplified solar gain proxy (W)

        # Lumped capacitance energy balance differential step:
        # C * (dT_in / dt) = Q_solar + UA_total * (T_out - T_in)
        # Analytical explicit solution for time step:
        t_eq = t_out + (q_solar / ua_total) if ua_total > 0 else t_out
        time_constant = thermal_mass_capacity / ua_total if ua_total > 0 else 1.0
        decay = math.exp(-dt_seconds / time_constant)

        t_inside_next = t_eq + (t_inside - t_eq) * decay

        # Heating demand check to maintain setpoint
        heating_kw = 0.0
        if t_inside_next < t_setpoint:
            needed_q_watts = ua_total * (t_setpoint - t_out) - q_solar
            heating_kw = max(0.0, needed_q_watts) / 1000.0

        inside_temps.append(t_inside_next)
        heating_demands_kwh.append(heating_kw)

        # Record component surface losses at current step
        comp_losses = assembly.calculate_component_losses(t_inside, t_out)
        for comp_name, loss_val in comp_losses.items():
            component_loss_series[comp_name].append(loss_val)

        t_inside = t_inside_next

    # Calculate summary metrics
    comfort_hours = sum(1 for t in inside_temps if 18.0 <= t <= 26.0)
    total_hours = len(inside_temps)
    comfort_percentage = (comfort_hours / total_hours * 100.0) if total_hours > 0 else 0.0
    total_heating_kwh = sum(heating_demands_kwh)

    results_df = pd.DataFrame(
        {
            "temp_outdoor": weather_df["temp_air"],
            "temp_indoor": inside_temps,
            "heating_demand_kw": heating_demands_kwh,
        }
    )

    return {
        "time_series": results_df,
        "component_losses": pd.DataFrame(component_loss_series),
        "comfort_percentage": comfort_percentage,
        "total_heating_kwh": total_heating_kwh,
    }