from pathlib import Path
import pandas as pd
from pvlib.iotools import read_epw


def load_epw_weather(file_path: str | Path) -> pd.DataFrame:
    """Parses an EPW file and returns a formatted hourly climate DataFrame.

    Returns columns: temp_air (°C), dni (W/m²), dhi (W/m²), ghi (W/m²),
    wind_speed (m/s), rel_hum (%)
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"EPW file not found: {path}")

    epw_data, metadata = read_epw(path)

    df = pd.DataFrame(
        {
            "temp_air": epw_data["temp_air"],
            "dni": epw_data["dni"],
            "dhi": epw_data["dhi"],
            "ghi": epw_data["ghi"],
            "wind_speed": epw_data["wind_speed"],
            "rel_hum": epw_data["relative_humidity"],
        }
    )

    # Ensure index is a clean 0-indexed integer series representing hours 0..N
    df = df.reset_index(drop=True)
    return df