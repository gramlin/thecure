from sqlalchemy.orm import mapped_column
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from .core import Base

class Role(Base):
    __tablename__ = "roles"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = mapped_column(String, unique=True, nullable=False)
    description = mapped_column(Text)
    parent_role_id = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"))
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class User(Base):
    __tablename__ = "users"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = mapped_column(String, unique=True)
    display_name = mapped_column(String)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UserRole(Base):
    __tablename__ = "user_roles"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role_id = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

class EntityPermission(Base):
    __tablename__ = "entity_permissions"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    entity_id = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
    can_create = mapped_column(Boolean, default=False)
    can_read   = mapped_column(Boolean, default=False)
    can_update = mapped_column(Boolean, default=False)
    can_delete = mapped_column(Boolean, default=False)
    row_filter_json = mapped_column(JSONB)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class FieldPermission(Base):
    __tablename__ = "field_permissions"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id = mapped_column(UUID(as_uuid=_
