import uuid
from datetime import datetime, timedelta

from src.api.reviews import get_scheduler
from src.db.models import Card, Review, ReviewFeedback
from src.main import app
from src.schedulers.basic import BasicScheduler
from tests.asserts import is_utc_isoformat_string, is_uuid_string


async def test_create_review(db_session, user, user_client):
    app.dependency_overrides[get_scheduler] = lambda: BasicScheduler()

    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201
    deck_id = res.json()["id"]

    res = await user_client.post(
        "/cards", json={"deck_id": deck_id, "content": "Test card"}
    )
    assert res.status_code == 201
    card_id = res.json()["id"]

    # 1st review
    res = await user_client.post(
        "/reviews",
        json={
            "card_id": card_id,
            "user_id": str(user.id),
            "feedback": ReviewFeedback.OK,
        },
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "card_id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "reviewed_at": is_utc_isoformat_string(),
        "feedback": ReviewFeedback.OK,
        "interval": 1,
        "repetitions": 1,
        "ease_factor": 2.65,
        "created_at": is_utc_isoformat_string(),
    }

    reviewed_at = res.json()["reviewed_at"]
    interval = res.json()["interval"]
    next_review_date = datetime.fromisoformat(reviewed_at).date() + timedelta(
        days=interval
    )

    card = Card.get(db_session, card_id)
    assert card is not None
    assert card.next_review_date.date() == next_review_date

    # 2nd review
    res = await user_client.post(
        "/reviews",
        json={
            "card_id": card_id,
            "user_id": str(user.id),
            "feedback": ReviewFeedback.OK,
        },
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "card_id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "reviewed_at": is_utc_isoformat_string(),
        "feedback": ReviewFeedback.OK,
        "interval": 5,
        "repetitions": 2,
        "ease_factor": 2.80,
        "created_at": is_utc_isoformat_string(),
    }

    reviewed_at = res.json()["reviewed_at"]
    interval = res.json()["interval"]
    next_review_date = datetime.fromisoformat(reviewed_at).date() + timedelta(
        days=interval
    )

    card = Card.get(db_session, card_id)
    assert card is not None
    assert card.next_review_date.date() == next_review_date
    assert len(Review.all(db_session)) == 2

    app.dependency_overrides.clear()


async def test_create_review_card_wrong_user_returns_403(db_session, user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201
    deck_id = res.json()["id"]

    res = await user_client.post(
        "/cards", json={"deck_id": deck_id, "content": "Test card"}
    )
    assert res.status_code == 201
    card_id = res.json()["id"]

    res = await user_client.post(
        "/reviews",
        json={
            "card_id": card_id,
            "user_id": str(uuid.uuid4()),
            "feedback": ReviewFeedback.OK,
        },
    )
    assert res.status_code == 403


async def test_create_review_other_user_card(
    db_session, user, admin, admin_client, user_client
):
    res = await admin_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201
    deck_id = res.json()["id"]

    res = await admin_client.post(
        "/cards", json={"deck_id": deck_id, "content": "Test card"}
    )
    assert res.status_code == 201
    card_id = res.json()["id"]

    res = await user_client.post(
        "/reviews",
        json={
            "card_id": card_id,
            "user_id": str(admin.id),
            "feedback": ReviewFeedback.OK,
        },
    )
    assert res.status_code == 403


async def test_create_review_skipped(db_session, user, user_client):
    app.dependency_overrides[get_scheduler] = lambda: BasicScheduler()

    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201
    deck_id = res.json()["id"]

    res = await user_client.post(
        "/cards", json={"deck_id": deck_id, "content": "Test card"}
    )
    assert res.status_code == 201
    card_id = res.json()["id"]

    res = await user_client.post(
        "/reviews",
        json={
            "card_id": card_id,
            "user_id": str(user.id),
            "feedback": ReviewFeedback.SKIPPED,
        },
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "card_id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "reviewed_at": is_utc_isoformat_string(),
        "feedback": ReviewFeedback.SKIPPED,
        "interval": 1,
        "repetitions": 0,
        "ease_factor": 2.5,
        "created_at": is_utc_isoformat_string(),
    }

    reviewed_at = res.json()["reviewed_at"]
    interval = res.json()["interval"]
    next_review_date = datetime.fromisoformat(reviewed_at).date() + timedelta(
        days=interval
    )

    card = Card.get(db_session, card_id)
    assert card is not None
    assert card.next_review_date.date() == next_review_date

    app.dependency_overrides.clear()


async def test_create_review_forgot(db_session, user, user_client):
    app.dependency_overrides[get_scheduler] = lambda: BasicScheduler()

    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    assert res.status_code == 201
    deck_id = res.json()["id"]

    res = await user_client.post(
        "/cards", json={"deck_id": deck_id, "content": "Test card"}
    )
    assert res.status_code == 201
    card_id = res.json()["id"]

    res = await user_client.post(
        "/reviews",
        json={
            "card_id": card_id,
            "user_id": str(user.id),
            "feedback": ReviewFeedback.FORGOT,
        },
    )
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "card_id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "reviewed_at": is_utc_isoformat_string(),
        "feedback": ReviewFeedback.FORGOT,
        "interval": 1,
        "repetitions": 0,
        "ease_factor": 2.3,
        "created_at": is_utc_isoformat_string(),
    }

    reviewed_at = res.json()["reviewed_at"]
    interval = res.json()["interval"]
    next_review_date = datetime.fromisoformat(reviewed_at).date() + timedelta(
        days=interval
    )

    card = Card.get(db_session, card_id)
    assert card is not None
    assert card.next_review_date.date() == next_review_date

    app.dependency_overrides.clear()
