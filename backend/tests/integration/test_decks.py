import uuid

from src.db.models import Deck
from tests.asserts import is_utc_isoformat_string, is_uuid_string


async def test_create_deck_returns_deck(db_session, user, user_client):
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

    deck = Deck.filter_by(db_session, user_id=user.id).first()
    assert deck is not None


async def test_create_deck_unauthorized_returns_401(db_session, client):
    res = await client.post("/decks")
    assert res.status_code == 401

    deck = Deck.all(db_session)
    assert deck == []


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
    assert res.json() == [
        {
            "id": is_uuid_string(),
            "user_id": str(user.id),
            "name": "deck",
            "description": "my deck",
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        }
    ]


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

    deck_id = res.json()["id"]
    res = await user_client.patch(
        f"/decks/{deck_id}", json={"name": "test", "description": "test"}
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
        f"/decks/{uuid.uuid4()}", json={"name": "test", "description": "test"}
    )
    assert res.status_code == 404
    assert res.json()["detail"] == "Deck not found or access denied"


async def test_update_deck_wrong_user_returns_404(admin_client, user_client):
    res = await admin_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201

    deck_id = res.json()["id"]
    res = await user_client.patch(
        f"/decks/{deck_id}", json={"name": "test", "description": "test"}
    )
    assert res.status_code == 404
    assert res.json()["detail"] == "Deck not found or access denied"


async def test_delete_deck(db_session, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201

    deck_id = res.json()["id"]
    res = await user_client.delete(f"/decks/{deck_id}")
    assert res.status_code == 200
    assert res.json() == {"id": is_uuid_string()}

    deck = Deck.all(db_session)
    assert deck == []


async def test_delete_deck_doesnt_exist_returns_404(db_session, user_client):
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
    assert res.json()["detail"] == "Deck not found or access denied"

    deck = Deck.filter_by(db_session, name="deck").first()
    assert deck is not None
