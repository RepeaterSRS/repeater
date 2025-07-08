from src.db.models import AuthProviders
from tests.asserts import is_utc_isoformat_string


async def test_get_me(user, user_client):
    res = await user_client.get("/me")
    assert res.json() == {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "auth_provider": AuthProviders.PASSWORD,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }
