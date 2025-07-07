from freezegun import freeze_time

from src.db.models import ReviewFeedback


@freeze_time("2025-07-02 13:00:00")
async def test_get_statistics(ignore_jwt_expiration, user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    deck_id = res.json()["id"]

    res = await user_client.post(
        "/cards", json={"deck_id": deck_id, "content": "Test card"}
    )
    card_id = res.json()["id"]

    with freeze_time("2025-07-01 12:00:00"):
        res = await user_client.post(
            "/reviews",
            json={
                "card_id": card_id,
                "user_id": str(user.id),
                "feedback": ReviewFeedback.FORGOT,
            },
        )

    with freeze_time("2025-07-02 12:00:00"):
        res = await user_client.post(
            "/reviews",
            json={
                "card_id": card_id,
                "user_id": str(user.id),
                "feedback": ReviewFeedback.OK,
            },
        )

    res = await user_client.get(
        "/stats",
    )
    assert res.status_code == 200
    assert res.json() == {
        "total_reviews": 2,
        "daily_reviews": {
            "2025-07-01": 1,
            "2025-07-02": 1,
        },
        "streak": 2,
        "success_rate": 0.5,
    }


@freeze_time("2025-07-01")
async def test_get_statistics_same_day(ignore_jwt_expiration, user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    deck_id = res.json()["id"]

    res = await user_client.post(
        "/cards", json={"deck_id": deck_id, "content": "Test card"}
    )
    card_id = res.json()["id"]

    with freeze_time("2025-06-23"):
        res = await user_client.post(
            "/reviews",
            json={
                "card_id": card_id,
                "user_id": str(user.id),
                "feedback": ReviewFeedback.OK,
            },
        )

    with freeze_time("2025-06-23"):
        res = await user_client.post(
            "/reviews",
            json={
                "card_id": card_id,
                "user_id": str(user.id),
                "feedback": ReviewFeedback.OK,
            },
        )

    res = await user_client.get(
        "/stats",
    )
    assert res.status_code == 200
    assert res.json() == {
        "total_reviews": 2,
        "daily_reviews": {
            "2025-06-23": 2,
        },
        "streak": 0,
        "success_rate": 1,
    }


@freeze_time("2025-07-02")
async def test_get_statistics_skipped(ignore_jwt_expiration, user, user_client):
    res = await user_client.post(
        "/decks",
        json={
            "name": "deck",
            "description": "my deck",
        },
    )
    deck_id = res.json()["id"]

    res = await user_client.post(
        "/cards", json={"deck_id": deck_id, "content": "Test card"}
    )
    card_id = res.json()["id"]

    with freeze_time("2025-06-30"):
        res = await user_client.post(
            "/reviews",
            json={
                "card_id": card_id,
                "user_id": str(user.id),
                "feedback": ReviewFeedback.FORGOT,
            },
        )

    with freeze_time("2025-07-01"):
        res = await user_client.post(
            "/reviews",
            json={
                "card_id": card_id,
                "user_id": str(user.id),
                "feedback": ReviewFeedback.SKIPPED,
            },
        )

    res = await user_client.get(
        "/stats",
    )
    assert res.status_code == 200
    assert res.json() == {
        "total_reviews": 2,
        "daily_reviews": {
            "2025-06-30": 1,
            "2025-07-01": 1,
        },
        "streak": 2,
        "success_rate": 0,
    }
