from fastapi import FastAPI

app = FastAPI(title="THERMOSHELTER API")


@app.get("/health")
def health():
    return {"status": "ok", "service": "thermoshelter-api"}