import pandas as pd
import pytest
from app.thermal.driver import run_thermal_simulation
from app.thermal.envelope import BuildingAssembly, EnvelopeComponent, MaterialLayer


@pytest.fixture
def sample_weather_df() -> pd.DataFrame:
    """Provides a synthetic 24-hour climate DataFrame for testing."""
    return pd.DataFrame(
        {
            "temp_air": [-10.0] * 24,
            "dni": [0.0] * 6 + [500.0] * 8 + [0.0] * 10,
            "dhi": [0.0] * 6 + [100.0] * 8 + [0.0] * 10,
            "ghi": [0.0] * 6 + [300.0] * 8 + [0.0] * 10,
            "wind_speed": [2.5] * 24,
            "rel_hum": [50.0] * 24,
        }
    )


@pytest.fixture
def sample_assembly() -> BuildingAssembly:
    """Provides a basic two-component building envelope assembly."""
    wall_layer = MaterialLayer(
        name="Insulation", thickness=0.1, thermal_conductivity=0.04
    )
    wall = EnvelopeComponent(name="Walls", area=100.0, layers=[wall_layer])
    roof = EnvelopeComponent(name="Roof", area=50.0, override_r_value=3.0)
    return BuildingAssembly(components=[wall, roof])


def test_simulation_driver_execution(sample_weather_df, sample_assembly):
    """Verifies that the transient simulation driver executes and returns expected structure."""
    results = run_thermal_simulation(
        weather_df=sample_weather_df,
        assembly=sample_assembly,
        building_volume=120.0,
        thermal_mass_capacity=5e6,
        ach=0.5,
    )

    assert "time_series" in results
    assert "component_losses" in results
    assert "comfort_percentage" in results
    assert "total_heating_kwh" in results

    # Ensure 24 hours of output were generated
    assert len(results["time_series"]) == 24
    assert len(results["component_losses"]) == 24


def test_component_loss_breakout(sample_weather_df, sample_assembly):
    """Verifies that heat loss tracking generates separate columns per component."""
    results = run_thermal_simulation(
        weather_df=sample_weather_df,
        assembly=sample_assembly,
        building_volume=120.0,
        thermal_mass_capacity=5e6,
    )

    comp_df = results["component_losses"]
    assert "Walls" in comp_df.columns
    assert "Roof" in comp_df.columns
    assert comp_df["Walls"].iloc[0] > 0.0