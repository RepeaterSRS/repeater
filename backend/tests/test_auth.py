from src.db.models import UserRole
from tests.asserts import IsUUIDString


async def test_register(client):
    res = await client.post(
        "/auth/register", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 200
    assert res.json() == {
        "id": IsUUIDString(),
        "email": "user@domain.com",
        "role": UserRole.USER,
    }
