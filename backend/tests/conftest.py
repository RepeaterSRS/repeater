from os import getenv

import bcrypt
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.db import get_db
from src.db.models import Base, User, UserRole
from src.main import app

database_url = getenv("DATABASE_URL")
engine = create_engine(database_url)
TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    testing_session = TestingSessionLocal()
    try:
        yield testing_session
    finally:
        testing_session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
async def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def admin(db_session):
    email = "admin@domain.com"
    password = "password"

    pw_bytes = password.encode("utf-8")
    pw_hashed = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")
    user = User(email=email, password_hash=pw_hashed, role=UserRole.ADMIN)
    user.save(db_session)
    return user


@pytest.fixture
async def admin_client(admin, client):
    res = await client.post(
        "/auth/login",
        json={
            "email": "admin@domain.com",
            "password": "password",
        },
    )
    token = res.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield client


@pytest.fixture
def user(db_session):
    email = "user@domain.com"
    password = "password"

    pw_bytes = password.encode("utf-8")
    pw_hashed = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")
    user = User(email=email, password_hash=pw_hashed, role=UserRole.USER)
    user.save(db_session)
    return user


@pytest.fixture
async def user_client(admin, client):
    res = await client.post(
        "/auth/login",
        json={
            "email": "user@domain.com",
            "password": "password",
        },
    )
    token = res.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield client
