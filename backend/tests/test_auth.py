import pytest


async def test_login(client):
    res = await client.post(
        "/auth/login", json={"email": "user@domain.com", "password": "123"}
    )
    assert res.status_code == 200
