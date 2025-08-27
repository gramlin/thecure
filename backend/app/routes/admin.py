from fastapi import APIRouter

router = APIRouter()

# Stub endpoints for Admin (4GL) APIs — expand later.
@router.get("/apps")
async def list_apps():
    return []

@router.post("/apps")
async def create_app(payload: dict):
    return payload
