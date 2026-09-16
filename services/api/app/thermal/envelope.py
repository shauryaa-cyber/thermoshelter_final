from pydantic import BaseModel, Field


class MaterialLayer(BaseModel):
    """Represents an individual material layer in an assembly."""

    name: str
    thickness: float = Field(..., gt=0, description="Thickness in meters")
    thermal_conductivity: float = Field(
        ..., gt=0, description="Conductivity k in W/(m·K)"
    )

    @property
    def r_value(self) -> float:
        return self.thickness / self.thermal_conductivity


class EnvelopeComponent(BaseModel):
    """Represents an individual surface component (e.g., Roof, South Wall, Window)."""

    name: str
    area: float = Field(..., gt=0, description="Surface area in m²")
    layers: list[MaterialLayer] = Field(default_factory=list)
    override_r_value: float | None = Field(
        default=None, gt=0, description="Direct R-value for glazing/doors"
    )
    r_inside: float = Field(
        default=0.13, ge=0, description="Indoor film resistance (m²·K)/W"
    )
    r_outside: float = Field(
        default=0.04, ge=0, description="Outdoor film resistance (m²·K)/W"
    )

    @property
    def r_total(self) -> float:
        if self.override_r_value is not None:
            return self.override_r_value
        return self.r_inside + sum(layer.r_value for layer in self.layers) + self.r_outside

    @property
    def u_value(self) -> float:
        return 1.0 / self.r_total

    @property
    def ua(self) -> float:
        """Thermal conductance UA (W/K) for this component."""
        return self.u_value * self.area


class BuildingAssembly(BaseModel):
    """Collection of all envelope components making up the shelter structure."""

    name: str = "Shelter Envelope"
    components: list[EnvelopeComponent] = Field(default_factory=list)

    @property
    def total_ua(self) -> float:
        """Sum of UA (W/K) across all envelope components."""
        return sum(comp.ua for comp in self.components)

    def calculate_component_losses(
        self, temp_inside: float, temp_outside: float
    ) -> dict[str, float]:
        """Calculates instantaneous conductive heat loss (Watts) per surface component."""
        delta_t = temp_inside - temp_outside
        return {comp.name: comp.ua * delta_t for comp in self.components}