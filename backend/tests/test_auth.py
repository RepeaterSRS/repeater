import time

from src.auth.jwt import decode_access_token
from src.db.models import User, UserRole
from tests.asserts import is_utc_isoformat_string, is_uuid_string


async def test_register_user(db_session, client):
    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "email": "user@domain.com",
        "role": UserRole.USER,
        "auth_provider": "password",
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }

    user = User.filter_by(db_session, email="user@domain.com").first()
    assert user is not None


async def test_cant_register_user_with_existing_email(db_session, client):
    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "email": "user@domain.com",
        "role": UserRole.USER,
        "auth_provider": "password",
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }

    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 400
    assert "Email is in use" in res.text


async def test_register_and_login_user(client):
    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 201

    res = await client.post(
        "/auth/login", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 200
    assert "access_token" in res.json()
    access_token = decode_access_token(res.json()["access_token"])
    access_token["sub"] == is_uuid_string()
    access_token["email"] == "user@domain.com"
    access_token["role"] == UserRole.USER
    now = int(time.time())
    assert abs(access_token["iat"] - now) < 5
    assert access_token["exp"] > now


async def test_register_and_login_user_wrong_credentials(client):
    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 201

    res = await client.post(
        "/auth/login", json={"email": "user@domain.com", "password": "wrongpassword"}
    )
    assert res.status_code == 400

    res = await client.post(
        "/auth/login", json={"email": "wrong@email.com", "password": "123"}
    )
    assert res.status_code == 400
