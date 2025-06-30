from unittest.mock import patch

from src.db.models import User


@patch("src.auth.oauth.oauth.google.authorize_access_token")
@patch("src.auth.oauth.oauth.google.parse_id_token")
async def test_oauth_auth(mock_parse, mock_token, client, db_session):
    mock_token.return_value = {"access_token": "fake-token"}
    mock_parse.return_value = {"email": "user@domain.com"}

    response = await client.get("/oauth/auth")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

    user = User.filter_by(db_session, email="user@domain.com").first()
    assert user is not None
