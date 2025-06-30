from unittest.mock import patch

from src.db.models import User


@patch("src.auth.oauth.oauth.google.authorize_access_token")
@patch("src.auth.oauth.oauth.google.parse_id_token")
async def test_oauth_auth(mock_parse, mock_token, client, db_session):
    mock_token.return_value = {"access_token": "fake-token"}
    mock_parse.return_value = {"email": "user@domain.com"}

    res = await client.get("/oauth/auth")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data

    user = User.filter_by(db_session, email="user@domain.com").first()
    assert user is not None


@patch("src.auth.oauth.oauth.google.authorize_access_token")
@patch("src.auth.oauth.oauth.google.parse_id_token")
async def test_oauth_auth_user_exists(mock_parse, mock_token, client, db_session):
    mock_token.return_value = {"access_token": "fake-token"}
    mock_parse.return_value = {"email": "user@domain.com"}

    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 201

    res = await client.get("/oauth/auth")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data

    user = User.filter_by(db_session, email="user@domain.com").first()
    assert user is not None
