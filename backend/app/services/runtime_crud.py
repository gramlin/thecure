from typing import Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

# Minimal demo CRUD for tickets entity.
async def list_records(session: AsyncSession, entity: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    if entity != 'tickets':
        return []
    stmt = text("""
        select id, title, description, status, created_by, created_at
        from public.tickets
        order by created_at desc
        limit :limit offset :offset
    """)
    result = await session.execute(stmt, dict(limit=limit, offset=offset))
    return [dict(r._mapping) for r in result]

async def create_record(session: AsyncSession, entity: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    if entity != 'tickets':
        return payload
    stmt = text("""
        insert into public.tickets (title, description, status, created_by)
        values (:title, :description, coalesce(:status, 'open'), coalesce(:created_by, gen_random_uuid()))
        returning id, title, description, status, created_by, created_at
    """)
    result = await session.execute(stmt, payload)
    row = result.first()
    await session.commit()
    return dict(row._mapping) if row else {}

async def update_record(session: AsyncSession, entity: str, record_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    if entity != 'tickets':
        return payload
    stmt = text("""
        update public.tickets
        set title = coalesce(:title, title),
            description = coalesce(:description, description),
            status = coalesce(:status, status)
        where id = :id
        returning id, title, description, status, created_by, created_at
    """)
    params = {**payload, "id": record_id}
    result = await session.execute(stmt, params)
    row = result.first()
    await session.commit()
    return dict(row._mapping) if row else {}

async def delete_record(session: AsyncSession, entity: str, record_id: str) -> None:
    if entity != 'tickets':
        return None
    stmt = text("delete from public.tickets where id = :id")
    await session.execute(stmt, {"id": record_id})
    await session.commit()
    return None
