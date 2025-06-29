import uuid

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


async def test_get_decks(user, user_client):
    res = await user_client.get("/decks")
    assert res.status_code == 200
    assert res.json() == []

    await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    res = await user_client.get("/decks")
    assert res.status_code == 200
    assert res.json() == [{
        "id": is_uuid_string(),
        "user_id": str(user.id),
        "name": "deck",
        "description": "my deck",
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }]


async def test_get_decks_unauthorized_returns_401(client):
    res = await client.get("/decks")
    assert res.status_code == 401


async def test_update_deck(user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201

    deck_id = res.json()['id']
    res = await user_client.patch(
            f"/decks/{deck_id}",
            json={"name": "test",
                  "description": "test"}
    )
    assert res.status_code == 200
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": str(user.id),
        "name": "test",
        "description": "test",
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_update_deck_doesnt_exist_returns_404(user_client):
    res = await user_client.patch(
            f"/decks/{uuid.uuid4()}",
            json={"name": "test",
                  "description": "test"}
    )
    assert res.status_code == 404


async def test_update_deck_wrong_user_returns_403(admin_client, user_client):
    res = await admin_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201

    deck_id = res.json()['id']
    res = await user_client.patch(
            f"/decks/{deck_id}",
            json={"name": "test",
                  "description": "test"}
    )
    assert res.status_code == 403


async def test_delete_deck(user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201

    deck_id = res.json()['id']
    res = await user_client.delete(f"/decks/{deck_id}")
    assert res.status_code == 200
    assert res.json() == {"id": is_uuid_string()}

    res = await user_client.get("/decks")
    assert res.status_code == 200
    assert res.json() == []


async def test_delete_deck_doesnt_exist_returns_404(user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201

    res = await user_client.delete(f"/decks/{uuid.uuid4()}")
    assert res.status_code == 404
