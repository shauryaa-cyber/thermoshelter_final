from pydantic import BaseModel, Field


class VentilationParams(BaseModel):
    ach: float = Field(
        default=0.5, ge=0.0, description="Air Changes per Hour (ACH)"
    )
    volume: float = Field(
        ..., gt=0.0, description="Internal shelter volume in m³"
    )
    air_density: float = Field(
        default=1.225, gt=0.0, description="Air density in kg/m³ (1.225 at sea level, ~0.85 for Leh elevation)"
    )
    specific_heat_air: float = Field(
        default=1005.0, gt=0.0, description="Specific heat capacity of air in J/(kg·K)"
    )

    def calculate_heat_loss(self, t_inside: float, t_outside: float) -> float:
        """Calculates ventilation/infiltration heat transfer rate in Watts (W).
        Positive output indicates net heat loss from inside to outside.
        """
        mass_flow_rate = (self.ach * self.volume / 3600.0) * self.air_density
        return mass_flow_rate * self.specific_heat_air * (t_inside - t_outside)