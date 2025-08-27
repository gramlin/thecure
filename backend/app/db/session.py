from typing import AsyncGenerator, Optional
import os
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/postgres")

engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session(jwt: Optional[str] = None) -> AsyncGenerator[AsyncSession, None]:
    async with engine.connect() as conn:
        # TODO: forward Supabase JWT → Postgres for RLS
        async with AsyncSession(bind=conn) as session:
            yield session
