import json
import uuid

from src.db.models import Card, Deck
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
        "category_id": None,
        "name": "deck",
        "description": "my deck",
        "is_paused": False,
        "is_archived": False,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }

    deck = Deck.filter_by(db_session, user_id=user.id).first()
    assert deck is not None


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
            "category_id": None,
            "name": "deck",
            "description": "my deck",
            "is_paused": False,
            "is_archived": False,
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        }
    ]


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
        "category_id": None,
        "name": "test",
        "description": "test",
        "is_paused": False,
        "is_archived": False,
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


async def test_import_deck_custom_importer(db_session, user_client):
    with open("data/french.json", "rb") as file:
        file_bytes = file.read()
        file.seek(0)
        deck_json = json.load(file)

    files = {"file": ("french.json", file_bytes, "application/json")}
    res = await user_client.post(
        "decks/import", params={"format": "repeater"}, files=files
    )
    assert res.status_code == 201

    deck = Deck.all(db_session)[0]
    assert deck_json["name"] == deck.name
    assert len(deck_json["cards"]) == len(Card.all(db_session))


async def test_export_deck(db_session, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    deck_id = res.json()["id"]
    res = await user_client.post(
        "/cards",
        json={
            "deck_id": deck_id,
            "content": "Test card",
        },
    )

    res = await user_client.get(f"/decks/{deck_id}/export")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/octet-stream"

    json_str = res.content.decode("utf-8")
    json_obj = json.loads(json_str)
    assert json_obj == {
        "version": "repeater-v1",
        "name": "deck",
        "description": "my deck",
        "cards": [{"content": "Test card"}],
    }


async def test_guest_user_import_deck_returns_403(client):
    with open("data/french.json", "rb") as file:
        file_bytes = file.read()

    files = {"file": ("french.json", file_bytes, "application/json")}
    res = await client.post("decks/import", params={"format": "repeater"}, files=files)
    assert res.status_code == 403


async def test_guest_user_export_deck_returns_403(client):
    res = await client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    deck_id = res.json()["id"]
    res = await client.post(
        "/cards",
        json={
            "deck_id": deck_id,
            "content": "Test card",
        },
    )

    res = await client.get(f"/decks/{deck_id}/export")
    assert res.status_code == 403


async def test_move_deck_to_existing_category(user_client):
    res = await user_client.post(
        "/categories",
        json={"name": "c1"},
    )
    assert res.status_code == 201
    c1_id = res.json()["id"]

    res = await user_client.post(
        "/categories",
        json={"name": "c2"},
    )
    assert res.status_code == 201
    c2_id = res.json()["id"]

    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
            "category_id": c1_id,
        },
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "category_id": c1_id,
        "name": "deck",
        "description": "my deck",
        "is_paused": False,
        "is_archived": False,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }
    deck_id = res.json()["id"]

    res = await user_client.patch(
        f"/decks/{deck_id}",
        json={
            "category_id": c2_id,
        },
    )
    assert res.status_code == 200
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "category_id": c2_id,
        "name": "deck",
        "description": "my deck",
        "is_paused": False,
        "is_archived": False,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_move_deck_to_uncategorized(user_client):
    res = await user_client.post(
        "/categories",
        json={"name": "category"},
    )
    assert res.status_code == 201
    category_id = res.json()["id"]

    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
            "category_id": category_id,
        },
    )
    assert res.status_code == 201
    deck_id = res.json()["id"]

    res = await user_client.patch(
        f"/decks/{deck_id}",
        json={
            "category_id": None,
        },
    )
    assert res.status_code == 200
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "category_id": None,
        "name": "deck",
        "description": "my deck",
        "is_paused": False,
        "is_archived": False,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_move_deck_to_nonexistent_category(user_client):
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
        f"/decks/{deck_id}",
        json={
            "category_id": str(uuid.uuid4()),
        },
    )
    assert res.status_code == 404


async def test_move_deck_to_other_users_category(user_client, admin_client):
    res = await admin_client.post(
        "/categories",
        json={"name": "category"},
    )
    assert res.status_code == 201
    category_id = res.json()["id"]

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
        f"/decks/{deck_id}",
        json={
            "category_id": category_id,
        },
    )
    assert res.status_code == 404


async def test_get_decks_by_category(user, user_client):
    res = await user_client.post(
        "/categories",
        json={"name": "category"},
    )
    assert res.status_code == 201
    category_id = res.json()["id"]

    await user_client.post(
        "/decks",
        json={
            "name": "deck inside category",
            "description": "my deck",
            "category_id": category_id,
        },
    )
    assert res.status_code == 201

    await user_client.post(
        "/decks",
        json={
            "name": "deck outside category",
            "description": "my deck",
        },
    )
    assert res.status_code == 201

    res = await user_client.get("/decks", params={"category_id": category_id})
    assert res.json() == [
        {
            "id": is_uuid_string(),
            "user_id": str(user.id),
            "category_id": category_id,
            "name": "deck inside category",
            "description": "my deck",
            "is_paused": False,
            "is_archived": False,
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        }
    ]
