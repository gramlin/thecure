from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.session import get_session
from ..services import runtime_crud

router = APIRouter()

@router.get("/{entity}/records")
async def list_records(entity: str, authorization: str | None = Header(default=None), session: AsyncSession = Depends(get_session)):
    return await runtime_crud.list_records(session, entity)

@router.post("/{entity}/records")
async def create_record(entity: str, payload: dict, authorization: str | None = Header(default=None), session: AsyncSession = Depends(get_session)):
    return await runtime_crud.create_record(session, entity, payload)

@router.patch("/{entity}/records/{record_id}")
async def update_record(entity: str, record_id: str, payload: dict, authorization: str | None = Header(default=None), session: AsyncSession = Depends(get_session)):
    return await runtime_crud.update_record(session, entity, record_id, payload)

@router.delete("/{entity}/records/{record_id}")
async def delete_record(entity: str, record_id: str, authorization: str | None = Header(default=None), session: AsyncSession = Depends(get_session)):
    await runtime_crud.delete_record(session, entity, record_id)
    return {"status": "deleted"}
