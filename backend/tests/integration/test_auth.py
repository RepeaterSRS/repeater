from freezegun import freeze_time

from src.auth.jwt import decode_jwt
from src.db.models import AuthProviders, User, UserRole
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
        "auth_provider": AuthProviders.PASSWORD,
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
        "auth_provider": AuthProviders.PASSWORD,
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
    assert res.status_code == 204
    cookies = res.cookies
    assert "access_token" in cookies
    access_token = cookies.get("access_token")
    access_token = decode_jwt(access_token)
    access_token["sub"] == is_uuid_string()
    access_token["role"] == UserRole.USER


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


@freeze_time("2025-07-07 12:00:00")
async def test_refresh_token(client, frontend_url):
    res = await client.post(
        "/auth/register", json={"email": "test@domain.com", "password": "password"}
    )
    assert res.status_code == 201

    res = await client.post(
        "/auth/login", json={"email": "test@domain.com", "password": "password"}
    )
    assert res.status_code == 204
    access_token = res.cookies.get("access_token")
    refresh_token = res.cookies.get("refresh_token")

    access_token_payload = decode_jwt(access_token)
    refresh_token_payload = decode_jwt(refresh_token)

    access_token_payload["sub"] == is_uuid_string()
    access_token_payload["role"] == UserRole.GUEST
    access_token_payload["token_version"] == 0

    refresh_token_payload["jti"] == is_uuid_string()
    refresh_token_payload["token_version"] == 0

    # Access token has expired
    with freeze_time("2025-07-07 13:01:00"):
        res = await client.get("/me")
        assert res.status_code == 401

        res = await client.post("/auth/refresh")
        new_access_token = res.cookies.get("access_token")
        assert new_access_token

        res = await client.get("/me")
        assert res.status_code == 200

    # Refresh token has expired
    with freeze_time("2025-07-17 12:01:00"):
        res = await client.post("/auth/refresh")
        assert res.status_code == 401


async def test_token_version_mismatch_returns_401(client, db_session):
    res = await client.post(
        "/auth/register", json={"email": "test@domain.com", "password": "password"}
    )
    assert res.status_code == 201
    user_id = res.json()["id"]

    res = await client.post(
        "/auth/login", json={"email": "test@domain.com", "password": "password"}
    )
    assert res.status_code == 204

    user = User.get(db_session, user_id)
    assert user
    user.token_version = 999
    user.save(db_session)

    res = await client.post("/auth/refresh")
    assert res.status_code == 401


async def test_guest_user_is_created(client):
    res1 = await client.get("/me")
    assert res1.status_code == 200
    assert "access_token" in res1.cookies
    assert "refresh_token" in res1.cookies
    assert res1.json() == {
        "id": is_uuid_string(),
        "email": None,
        "role": UserRole.GUEST,
        "auth_provider": AuthProviders.PASSWORD,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }

    res2 = await client.get("/me")
    assert res1.json() == res2.json()
    assert "access_token" not in res2.cookies
    assert "refresh_token" not in res2.cookies


async def test_guest_user_promotion_register(client):
    res = await client.get("/me")
    assert res.status_code == 200
    assert "access_token" in res.cookies
    assert "refresh_token" in res.cookies

    assert res.json() == {
        "id": is_uuid_string(),
        "email": None,
        "role": UserRole.GUEST,
        "auth_provider": AuthProviders.PASSWORD,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }
    user_id = res.json()["id"]

    res = await client.post(
        "/auth/register",
        json={"email": "guest_promote@domain.com", "password": "password"},
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": user_id,
        "email": "guest_promote@domain.com",
        "role": UserRole.USER,
        "auth_provider": AuthProviders.PASSWORD,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_logout(user_client, frontend_url):
    res = await user_client.post("/auth/logout")
    assert res.status_code == 204
    assert "access_token" not in res.cookies
    assert "refresh_token" not in res.cookies
    assert "access_token" not in user_client.cookies
    assert "refresh_token" not in user_client.cookies


async def test_register_user_email_is_case_insensitive(db_session, client):
    res = await client.post(
        "/auth/register", json={"email": "USER@domain.com", "password": "123"}
    )
    assert res.status_code == 201

    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 400


async def test_login_user_email_is_case_insensitive(db_session, client):
    res = await client.post(
        "/auth/register", json={"email": "USER@domain.com", "password": "123"}
    )
    assert res.status_code == 201

    res = await client.post(
        "/auth/login", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 204
