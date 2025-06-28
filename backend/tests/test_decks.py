from tests.asserts import is_utc_isoformat_string, is_uuid_string


async def test_create_deck_returns_deck(user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": str(user.id),
        "name": "deck",
        "description": "my deck",
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_create_deck_unauthorized_returns_401(client):
    res = await client.post("/decks")
    assert res.status_code == 401
