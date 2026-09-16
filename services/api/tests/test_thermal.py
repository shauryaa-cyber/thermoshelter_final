import pandas as pd
import pytest
from app.thermal.comfort import calculate_comfort_metrics
from app.thermal.envelope import BuildingAssembly, MaterialLayer
from app.thermal.transient import ThermalSimulationConfig, run_transient_simulation
from app.thermal.ventilation import VentilationParams


def test_envelope_u_value_reduction():
    # Adding insulation thickness should lower the U-value
    thin_layer = MaterialLayer(name="EPS", thickness=0.05, thermal_conductivity=0.035)
    thick_layer = MaterialLayer(name="EPS", thickness=0.15, thermal_conductivity=0.035)

    wall_thin = BuildingAssembly(name="Thin Wall", layers=[thin_layer])
    wall_thick = BuildingAssembly(name="Thick Wall", layers=[thick_layer])

    assert wall_thick.u_value < wall_thin.u_value


def test_ventilation_heat_loss():
    vent = VentilationParams(ach=1.0, volume=100.0, air_density=1.0)
    # Inside warmer than outside -> positive heat loss (W)
    loss = vent.calculate_heat_loss(t_inside=20.0, t_outside=0.0)
    assert loss > 0.0


def test_transient_simulation_temperature_rise():
    times = pd.date_range("2026-01-15 12:00", periods=2, freq="h")
    t_out = pd.Series([0.0, 0.0], index=times)
    q_sol = pd.Series([5000.0, 5000.0], index=times)  # High solar gain

    vent = VentilationParams(ach=0.2, volume=50.0)
    cfg = ThermalSimulationConfig(initial_temperature=10.0, thermal_mass_capacitance=1e5)

    df = run_transient_simulation(
        cfg, times, t_out, q_sol, u_envelope=0.2, total_envelope_area=50.0, ventilation_loss_func=vent.calculate_heat_loss
    )

    # Temperature should increase due to solar gains
    assert df["temperature"].iloc[-1] > df["temperature"].iloc[0]


def test_comfort_metrics():
    temps = pd.Series([10.0, 20.0, 22.0, 15.0])
    t_out = pd.Series([0.0, 0.0, 0.0, 0.0])
    vent = VentilationParams(ach=0.5, volume=60.0)

    metrics = calculate_comfort_metrics(
        temps, t_out, u_envelope=0.3, total_envelope_area=60.0, ventilation_loss_func=vent.calculate_heat_loss
    )

    # 2 out of 4 temperatures (20.0 and 22.0) are within 18°C–26°C range -> 50%
    assert metrics.comfort_hours_percentage == 50.0
    assert metrics.total_heating_kwh > 0.0