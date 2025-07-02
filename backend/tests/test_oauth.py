from unittest.mock import patch

from src.db.models import User


@patch("src.auth.oauth.oauth.google.authorize_access_token")
async def test_oauth_auth(mock_token, client, db_session):
    mock_token.return_value = {"userinfo": {"email": "user@domain.com"}}

    res = await client.get("/oauth/auth")
    assert res.status_code == 302
    assert res.headers["location"] == "http://localhost:3000"
    cookies = res.cookies
    assert "access_token" in cookies

    user = User.filter_by(db_session, email="user@domain.com").first()
    assert user is not None
    assert user.auth_provider == "google"


@patch("src.auth.oauth.oauth.google.authorize_access_token")
async def test_oauth_auth_user_exists(mock_token, client, db_session):
    mock_token.return_value = {"userinfo": {"email": "user@domain.com"}}

    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 201

    res = await client.get("/oauth/auth")
    assert res.status_code == 302
    assert res.headers["location"] == "http://localhost:3000"
    cookies = res.cookies
    assert "access_token" in cookies

    user = User.filter_by(db_session, email="user@domain.com").first()
    assert user is not None
    assert user.auth_provider == "password"


@patch("src.auth.oauth.oauth.google.authorize_access_token")
async def test_oauth_auth_log_in_with_password_should_return_403(
    mock_token, client, db_session
):
    mock_token.return_value = {"userinfo": {"email": "user@domain.com"}}

    res = await client.get("/oauth/auth")
    assert res.status_code == 302
    assert res.headers["location"] == "http://localhost:3000"
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
