from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Set
from ..models.views import CurrentUserEntityPermission, CurrentUserFieldPermission

async def fetch_entity_permissions(session: AsyncSession) -> Dict[str, dict]:
    result = await session.execute(select(CurrentUserEntityPermission))
    perms = {}
    for row in result.scalars():
        perms[row.entity_name] = {
            "can_create": row.can_create,
            "can_read": row.can_read,
            "can_update": row.can_update,
            "can_delete": row.can_delete,
            "row_filters": row.row_filters,
        }
    return perms

async def fetch_field_permissions(session: AsyncSession) -> Dict[str, Set[str]]:
    result = await session.execute(select(CurrentUserFieldPermission))
    readable: Dict[str, Set[str]] = {}
    updatable: Dict[str, Set[str]] = {}
    for row in result.scalars():
        readable.setdefault(row.entity_name, set())
        updatable.setdefault(row.entity_name, set())
        if row.can_read:
            readable[row.entity_name].add(row.field_name)
        if row.can_update:
            updatable[row.entity_name].add(row.field_name)
    return {"readable": readable, "updatable": updatable}
