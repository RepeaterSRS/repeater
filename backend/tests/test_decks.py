async def test_get_decks(user_client):
    res = await user_client.get("/decks")
    assert res.status_code == 200
    assert res.json() == []


async def test_get_decks_unauthorized(client):
    res = await client.get("/decks")
    assert res.status_code == 401
