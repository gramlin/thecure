from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

class Base(DeclarativeBase):
    pass

class Application(Base):
    __tablename__ = "applications"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = mapped_column(String, unique=True, nullable=False)
    description = mapped_column(Text)
    owner_user_id = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Entity(Base):
    __tablename__ = "entities"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    name = mapped_column(String, nullable=False)
    label = mapped_column(String)
    description = mapped_column(Text)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Field(Base):
    __tablename__ = "fields"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_id = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
    name = mapped_column(String, nullable=False)
    label = mapped_column(String)
    field_type = mapped_column(String, nullable=False)
    required = mapped_column(Boolean, default=False)
    default_value = mapped_column(String)
    relation_entity = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id"))
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Form(Base):
    __tablename__ = "forms"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    entity_id = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
    name = mapped_column(String, nullable=False)
    label = mapped_column(String)
    form_type = mapped_column(String, nullable=False)
    layout_json = mapped_column(JSONB, nullable=False)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Workflow(Base):
    __tablename__ = "workflows"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    entity_id = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
    name = mapped_column(String, nullable=False)
    description = mapped_column(Text)
    trigger_event = mapped_column(String, nullable=False)
    condition_json = mapped_column(JSONB)
    action_json = mapped_column(JSONB)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
