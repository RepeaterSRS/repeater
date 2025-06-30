import uuid

from src.db.models import Card
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


async def test_delete_deck(user_client):
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
    assert res.json()["detail"] == "Deck not found or access denied"


async def test_create_card_returns_card(user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    deck_id = res.json()["id"]

    res = await user_client.post(
        f"/decks/{deck_id}/cards",
        json={
            "content": "Test card",
        },
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "deck_id": deck_id,
        "content": "Test card",
        "next_review_date": is_utc_isoformat_string(),
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_create_card_wrong_user_returns_404(user, admin_client, user_client):
    res = await admin_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    deck_id = res.json()["id"]

    res = await user_client.post(
        f"/decks/{deck_id}/cards",
        json={
            "content": "Test card",
        },
    )
    assert res.status_code == 404
    assert res.json()["detail"] == "Deck not found or access denied"


async def test_create_card_deck_doesnt_exist_returns_404(user, user_client):
    res = await user_client.post(
        f"/decks/{uuid.uuid4()}/cards",
        json={
            "content": "Test card",
        },
    )
    assert res.status_code == 404
    assert res.json()["detail"] == "Deck not found or access denied"


async def test_get_cards(user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    deck_id = res.json()["id"]

    for i in range(5):
        await user_client.post(
            f"/decks/{deck_id}/cards",
            json={
                "content": f"Test card {i + 1}",
            },
        )

    res = await user_client.get(f"/decks/{deck_id}/cards")
    assert res.status_code == 200
    assert sorted(res.json(), key=lambda c: c["created_at"]) == [
        {
            "id": is_uuid_string(),
            "deck_id": deck_id,
            "content": "Test card 1",
            "next_review_date": is_utc_isoformat_string(),
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        },
        {
            "id": is_uuid_string(),
            "deck_id": deck_id,
            "content": "Test card 2",
            "next_review_date": is_utc_isoformat_string(),
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        },
        {
            "id": is_uuid_string(),
            "deck_id": deck_id,
            "content": "Test card 3",
            "next_review_date": is_utc_isoformat_string(),
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        },
        {
            "id": is_uuid_string(),
            "deck_id": deck_id,
            "content": "Test card 4",
            "next_review_date": is_utc_isoformat_string(),
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        },
        {
            "id": is_uuid_string(),
            "deck_id": deck_id,
            "content": "Test card 5",
            "next_review_date": is_utc_isoformat_string(),
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        },
    ]


async def test_update_card(user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )

    deck_id = res.json()["id"]
    res = await user_client.post(
        f"/decks/{deck_id}/cards",
        json={
            "content": "Test card",
        },
    )
    card_id = res.json()["id"]
    res = await user_client.patch(
        f"/decks/{deck_id}/cards/{card_id}",
        json={
            "content": "Updated card",
        },
    )
    assert res.json() == {
        "id": is_uuid_string(),
        "deck_id": deck_id,
        "content": "Updated card",
        "next_review_date": is_utc_isoformat_string(),
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_delete_card(user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )

    deck_id = res.json()["id"]
    res = await user_client.post(
        f"/decks/{deck_id}/cards",
        json={
            "content": "Test card",
        },
    )
    card_id = res.json()["id"]
    res = await user_client.delete(
        f"/decks/{deck_id}/cards/{card_id}",
    )
    assert res.json()["id"] == card_id

    res = await user_client.get(
        f"/decks/{deck_id}/cards",
    )
    assert res.json() == []


async def test_delete_deck_deletes_all_cards_in_deck(db_session, user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )

    deck_id = res.json()["id"]
    await user_client.post(
        f"/decks/{deck_id}/cards",
        json={
            "content": "Test card",
        },
    )
    res = await user_client.delete(f"/decks/{deck_id}")
    assert res.status_code == 200

    cards = Card.filter_by(db_session, deck_id=deck_id).all()
    assert cards == []
