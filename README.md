# THERMOSHELTER

An open-source platform for passive-shelter thermal design and optimization in extreme climates, with a Ladakh case-study focus.

## What it does

- Simulates shelter heat loss, solar gains, ventilation, and indoor temperature.
- Uses transparent Python physics models rather than black-box prediction models.
- Lets users adjust a shelter design through a Next.js dashboard and 3D view.
- Compares design options to improve comfort and reduce heating demand.

## Architecture

```text
apps/web       Next.js dashboard and Three.js shelter view
services/api   FastAPI API and thermal physics engine
data/weather   Climate and weather datasets

## Local development

Requirements: Node.js 24+, Python 3.13+, and Git.

Start the API:

```powershell
cd services\api
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirms that the API is running. |
| `POST` | `/api/v1/simulate` | Calculates thermal performance for one shelter design. |
| `POST` | `/api/v1/optimize` | Produces improved design options based on thermal objectives. |

Example simulation input:

```json
{
  "length": 6,
  "width": 4,
  "height": 2.8,
  "orientation": 0,
  "wall_insulation_thickness": 0.15
}

## Thermal model overview

THERMOSHELTER uses transparent, physics-based calculations:

- Conductive envelope loss: `Q = U × A × (T_indoor - T_outdoor)`
- Thermal resistance: `R = Σ(thickness / conductivity)` and `U = 1 / R`
- Ventilation loss: `Q_vent = ρ × c_p × ACH × Volume × ΔT / 3600`
- Solar gains use weather data and solar geometry.
- Indoor temperature is calculated through a transient energy balance over time.

Material properties, climate inputs, and assumptions remain inspectable in the Python backend.

# Contributing to THERMOSHELTER

Contributions are welcome. Please keep the project’s physics calculations transparent, testable, and free of black-box prediction models.

## Before opening a pull request

1. Create a branch from `main`.
2. Keep frontend and backend changes focused.
3. Add or update tests for Python physics changes.
4. Run these checks:

```powershell
cd services\api
.\.venv\Scripts\python.exe -m pytest tests