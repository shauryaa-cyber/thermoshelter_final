from pydantic import BaseModel, Field


class MaterialLayer(BaseModel):
    name: str
    thickness: float = Field(..., gt=0, description="Thickness in meters")
    thermal_conductivity: float = Field(
        ..., gt=0, description="Conductivity k in W/(m·K)"
    )

    @property
    def r_value(self) -> float:
        return self.thickness / self.thermal_conductivity


class BuildingAssembly(BaseModel):
    name: str
    layers: list[MaterialLayer]
    r_inside: float = Field(
        default=0.13, ge=0, description="Indoor surface film resistance (m²·K)/W"
    )
    r_outside: float = Field(
        default=0.04, ge=0, description="Outdoor surface film resistance (m²·K)/W"
    )

    @property
    def r_total(self) -> float:
        return self.r_inside + sum(layer.r_value for layer in self.layers) + self.r_outside

    @property
    def u_value(self) -> float:
        return 1.0 / self.r_total