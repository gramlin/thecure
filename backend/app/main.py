from fastapi import FastAPI
from .routes import runtime, admin

app = FastAPI(title="Codeless Platform API", version="0.1.0")

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(runtime.router, prefix="/api", tags=["runtime"])
app.include_router(admin.router,  prefix="/admin", tags=["admin"])
