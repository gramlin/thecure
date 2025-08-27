from sqlalchemy.orm import mapped_column
from sqlalchemy import String, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .core import Base

# Read-only ORM mappings to Postgres views

class CurrentUserEntityPermission(Base):
    __tablename__ = "current_user_entity_permissions"
    user_id = mapped_column(UUID(as_uuid=True), primary_key=True)
    entity_id = mapped_column(UUID(as_uuid=True), primary_key=True)
    entity_name = mapped_column(String)
    can_create = mapped_column(Boolean)
    can_read   = mapped_column(Boolean)
    can_update = mapped_column(Boolean)
    can_delete = mapped_column(Boolean)
    row_filters = mapped_column(JSONB)

class CurrentUserFieldPermission(Base):
    __tablename__ = "current_user_field_permissions"
    user_id = mapped_column(UUID(as_uuid=True), primary_key=True)
    field_id = mapped_column(UUID(as_uuid=True), primary_key=True)
    entity_id = mapped_column(UUID(as_uuid=True))
    field_name = mapped_column(String)
    entity_name = mapped_column(String)
    can_read   = mapped_column(Boolean)
    can_update = mapped_column(Boolean)
