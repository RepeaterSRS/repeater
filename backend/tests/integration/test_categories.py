from uuid import uuid4

from httpx import AsyncClient

from src.db.models import Category, Deck
from tests.asserts import is_utc_isoformat_string, is_uuid_string


async def create_category(
    client: AsyncClient,
    name: str = "category",
    description: str = None,
    parent_id: str = None,
):
    return await client.post(
        "/categories",
        json={"name": name, "description": description, "parent_id": parent_id},
    )


# ------- Test categories -------


async def test_create_root_category(user_client):
    res = await create_category(user_client)
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "name": "category",
        "description": None,
        "parent_id": None,
        "is_root": True,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_create_subcategory(user_client):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    category_id = res.json()["id"]

    res = await create_category(user_client, name="child", parent_id=category_id)
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "name": "child",
        "description": None,
        "parent_id": category_id,
        "is_root": False,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_get_categories(user_client):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await create_category(user_client, name="child", parent_id=parent_id)
    assert res.status_code == 201
    child_id = res.json()["id"]

    res = await user_client.get("/categories")
    assert res.json() == [
        {
            "id": child_id,
            "user_id": is_uuid_string(),
            "name": "child",
            "description": None,
            "parent_id": parent_id,
            "is_root": False,
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        },
        {
            "id": parent_id,
            "user_id": is_uuid_string(),
            "name": "parent",
            "description": None,
            "parent_id": None,
            "is_root": True,
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        },
    ]


async def test_get_category_tree(user_client):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await create_category(user_client, name="middle", parent_id=parent_id)
    assert res.status_code == 201
    middle_id = res.json()["id"]

    res = await create_category(user_client, name="child", parent_id=middle_id)
    assert res.status_code == 201
    child_id = res.json()["id"]

    res = await user_client.get("/categories/tree")

    assert res.json() == {
        "categories": [
            {
                "id": parent_id,
                "name": "parent",
                "decks": [],
                "children": [
                    {
                        "id": middle_id,
                        "name": "middle",
                        "decks": [],
                        "children": [
                            {
                                "id": child_id,
                                "name": "child",
                                "decks": [],
                                "children": [],
                                "deck_count": 0,
                                "depth": 3,
                            }
                        ],
                        "deck_count": 0,
                        "depth": 2,
                    }
                ],
                "deck_count": 0,
                "depth": 1,
            }
        ],
        "uncategorized_decks": [],
        "total_categories": 3,
        "total_decks": 0,
        "tree_depth": 3,
    }


async def test_move_category_to_new_parent(user_client):
    res = await create_category(user_client, name="parent 1")
    assert res.status_code == 201
    parent1_id = res.json()["id"]

    res = await create_category(user_client, name="parent 2")
    assert res.status_code == 201
    parent2_id = res.json()["id"]

    res = await create_category(user_client, name="child", parent_id=parent1_id)
    assert res.status_code == 201
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "name": "child",
        "description": None,
        "parent_id": parent1_id,
        "is_root": False,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }
    child_id = res.json()["id"]

    res = await user_client.patch(
        f"/categories/{child_id}", json={"parent_id": parent2_id}
    )
    assert res.status_code == 200
    assert res.json() == {
        "id": is_uuid_string(),
        "user_id": is_uuid_string(),
        "name": "child",
        "description": None,
        "parent_id": parent2_id,
        "is_root": False,
        "created_at": is_utc_isoformat_string(),
        "updated_at": is_utc_isoformat_string(),
    }


async def test_move_category_under_own_descendant(user_client):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await create_category(user_client, name="child", parent_id=parent_id)
    assert res.status_code == 201
    child_id = res.json()["id"]

    res = await user_client.patch(
        f"/categories/{parent_id}", json={"parent_id": child_id}
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Would create circular reference"


async def test_move_category_to_nonexistent_parent(user_client):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await user_client.patch(
        f"/categories/{parent_id}", json={"parent_id": str(uuid4())}
    )
    assert res.status_code == 404


async def test_move_category_to_other_users_category(user_client, admin_client):
    res = await create_category(admin_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await create_category(user_client, name="child")
    assert res.status_code == 201
    child_id = res.json()["id"]

    res = await user_client.patch(
        f"/categories/{child_id}", json={"parent_id": parent_id}
    )
    assert res.status_code == 404


async def test_delete_category_with_subcategories(user_client, db_session):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await create_category(user_client, name="child", parent_id=parent_id)
    assert res.status_code == 201
    child_id = res.json()["id"]

    res = await user_client.delete(f"/categories/{parent_id}")
    assert res.status_code == 200
    assert res.json() == {"id": parent_id}

    child_category = Category.get(db_session, child_id)
    assert child_category
    assert child_category.parent_id is None


async def test_delete_category_with_nested_structure(user_client, db_session):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await create_category(user_client, name="middle", parent_id=parent_id)
    assert res.status_code == 201
    middle_id = res.json()["id"]

    res = await create_category(user_client, name="child", parent_id=middle_id)
    assert res.status_code == 201
    child_id = res.json()["id"]

    res = await user_client.delete(f"/categories/{middle_id}")
    assert res.status_code == 200
    assert res.json() == {"id": middle_id}

    child_category = Category.get(db_session, child_id)
    assert child_category
    assert str(child_category.parent_id) == parent_id


async def test_user_can_only_see_own_categories(user_client, admin_client):
    res = await create_category(admin_client, name="admin")
    assert res.status_code == 201

    res = await create_category(user_client, name="user")
    assert res.status_code == 201

    res = await user_client.get("/categories")
    assert res.json() == [
        {
            "id": is_uuid_string(),
            "user_id": is_uuid_string(),
            "name": "user",
            "description": None,
            "parent_id": None,
            "is_root": True,
            "created_at": is_utc_isoformat_string(),
            "updated_at": is_utc_isoformat_string(),
        },
    ]


async def test_user_cannot_modify_other_users_categories(user_client, admin_client):
    res = await create_category(admin_client, name="admin")
    assert res.status_code == 201
    category_id = res.json()["id"]

    res = await create_category(user_client, name="user")
    assert res.status_code == 201

    res = await user_client.patch(f"/categories/{category_id}", json={"name": "test"})
    assert res.status_code == 404


async def test_self_referential_parent(user_client):
    res = await create_category(user_client, name="admin")
    assert res.status_code == 201
    category_id = res.json()["id"]

    res = await user_client.patch(
        f"/categories/{category_id}", json={"parent_id": category_id}
    )
    assert res.status_code == 400


# ------- Test decks with categories -------


async def test_get_category_tree_with_decks(user_client):
    # Uncategorized deck
    res = await user_client.post("/decks", json={"name": "uncategorized"})
    assert res.status_code == 201

    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    # Deck under parent
    res = await user_client.post(
        "/decks", json={"name": "parent", "category_id": parent_id}
    )
    assert res.status_code == 201

    res = await create_category(user_client, name="middle", parent_id=parent_id)
    assert res.status_code == 201
    middle_id = res.json()["id"]

    # Deck under middle
    res = await user_client.post(
        "/decks", json={"name": "middle", "category_id": middle_id}
    )
    assert res.status_code == 201

    res = await create_category(user_client, name="child1", parent_id=middle_id)
    assert res.status_code == 201
    child1_id = res.json()["id"]

    # Deck under child 1
    res = await user_client.post(
        "/decks", json={"name": "child1", "category_id": child1_id}
    )
    assert res.status_code == 201

    res = await create_category(user_client, name="child2", parent_id=middle_id)
    assert res.status_code == 201
    child2_id = res.json()["id"]

    # Deck under child 2
    res = await user_client.post(
        "/decks", json={"name": "child2", "category_id": child2_id}
    )
    assert res.status_code == 201

    # TODO this test might become flaky
    res = await user_client.get("/categories/tree")
    assert res.json() == {
        "categories": [
            {
                "id": parent_id,
                "name": "parent",
                "decks": [{"id": is_uuid_string(), "name": "parent"}],
                "children": [
                    {
                        "id": middle_id,
                        "name": "middle",
                        "decks": [{"id": is_uuid_string(), "name": "middle"}],
                        "children": [
                            {
                                "id": child1_id,
                                "name": "child1",
                                "decks": [
                                    {"id": is_uuid_string(), "name": "child1"},
                                ],
                                "children": [],
                                "deck_count": 1,
                                "depth": 3,
                            },
                            {
                                "id": child2_id,
                                "name": "child2",
                                "decks": [
                                    {"id": is_uuid_string(), "name": "child2"},
                                ],
                                "children": [],
                                "deck_count": 1,
                                "depth": 3,
                            },
                        ],
                        "deck_count": 1,
                        "depth": 2,
                    }
                ],
                "deck_count": 1,
                "depth": 1,
            }
        ],
        "uncategorized_decks": [
            {"id": is_uuid_string(), "name": "uncategorized"},
        ],
        "total_categories": 4,
        "total_decks": 5,
        "tree_depth": 3,
    }


async def test_delete_category_with_decks_move_to_parent(user_client, db_session):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await create_category(user_client, name="child", parent_id=parent_id)
    assert res.status_code == 201
    child_id = res.json()["id"]

    res = await user_client.post(
        "/decks", json={"name": "child", "category_id": child_id}
    )
    assert res.status_code == 201
    deck_id = res.json()["id"]

    res = await user_client.delete(f"/categories/{child_id}")
    assert res.status_code == 200

    deck = Deck.get(db_session, deck_id)
    assert str(deck.category_id) == parent_id


async def test_delete_category_with_decks_make_uncategorized(user_client, db_session):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await user_client.post(
        "/decks", json={"name": "child", "category_id": parent_id}
    )
    assert res.status_code == 201
    deck_id = res.json()["id"]

    res = await user_client.delete(f"/categories/{parent_id}")
    assert res.status_code == 200

    deck = Deck.get(db_session, deck_id)
    assert deck.category_id is None


async def test_get_category_tree_shallow(user_client):
    res = await create_category(user_client, name="parent")
    assert res.status_code == 201
    parent_id = res.json()["id"]

    res = await user_client.get("/categories/tree")
    assert res.json() == {
        "categories": [
            {
                "id": parent_id,
                "name": "parent",
                "decks": [],
                "children": [],
                "deck_count": 0,
                "depth": 1,
            }
        ],
        "uncategorized_decks": [],
        "total_categories": 1,
        "total_decks": 0,
        "tree_depth": 1,
    }
