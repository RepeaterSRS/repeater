from unittest.mock import patch

from src.db.models import AuthProviders, User, UserRole
from tests.asserts import is_utc_isoformat_string, is_uuid_string


@patch("src.auth.oauth.oauth.google.authorize_access_token")
async def test_oauth_auth(mock_token, client, frontend_url, db_session):
    mock_token.return_value = {"userinfo": {"email": "user@domain.com"}}

    res = await client.get("/oauth/auth")
    assert res.status_code == 302
    assert res.headers["location"] == frontend_url
    cookies = res.cookies
    assert "access_token" in cookies
    assert "refresh_token" in cookies

    user = User.filter_by(db_session, email="user@domain.com").first()
    assert user is not None
    assert user.auth_provider == AuthProviders.GOOGLE


@patch("src.auth.oauth.oauth.google.authorize_access_token")
async def test_oauth_auth_user_exists(mock_token, client, frontend_url, db_session):
    mock_token.return_value = {"userinfo": {"email": "user@domain.com"}}

    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 201

    res = await client.get("/oauth/auth")
    assert res.status_code == 302
    assert res.headers["location"] == frontend_url
    cookies = res.cookies
    assert "access_token" in cookies

    user = User.filter_by(db_session, email="user@domain.com").first()
    assert user is not None
    assert user.auth_provider == AuthProviders.PASSWORD


@patch("src.auth.oauth.oauth.google.authorize_access_token")
async def test_oauth_auth_log_in_with_password_should_return_403(
    mock_token, client, frontend_url
):
    mock_token.return_value = {"userinfo": {"email": "user@domain.com"}}

    res = await client.get("/oauth/auth")
    assert res.status_code == 302
    assert res.headers["location"] == frontend_url
    cookies = res.cookies
    assert "access_token" in cookies

    res = await client.post(
        "/auth/login", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 403
    assert (
        res.json()["detail"]
        == "This account was created via Google. Please use that provider to sign in."
    )


@patch("src.auth.oauth.oauth.google.authorize_access_token")
async def test_guest_user_promotion_oauth(mock_token, client):
    mock_token.return_value = {"userinfo": {"email": "user@domain.com"}}

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

    # This will promote the guest user to normal user
    await client.get("/oauth/auth")

    res = await client.get("/me")
    assert res.status_code == 200
    assert res.json() == {
        "id": user_id,
        "email": "user@domain.com",
        "role": UserRole.USER,
        "auth_provider": AuthProviders.GOOGLE,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }
