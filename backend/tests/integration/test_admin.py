from sqlalchemy.orm import Session

from src.db.models import AuthProviders, User, UserRole
from tests.asserts import is_utc_isoformat_string, is_uuid_string


def create_user(email: str, role: UserRole, db_session: Session):
    user = User(
        email=email,
        role=role,
    )
    user.save(db_session)
    return user


async def test_admin_get_users(db_session, admin, admin_client):
    create_user("test1@domain.com", UserRole.USER, db_session)
    create_user("test2@domain.com", UserRole.USER, db_session)
    create_user("test3@domain.com", UserRole.GUEST, db_session)

    res = await admin_client.get("/admin/users")
    assert res.status_code == 200

    assert res.json() == {
        "items": [
            {
                "id": is_uuid_string(),
                "email": "test2@domain.com",
                "role": UserRole.USER,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": False,
            },
            {
                "id": is_uuid_string(),
                "email": "test1@domain.com",
                "role": UserRole.USER,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": False,
            },
            {
                "id": is_uuid_string(),
                "email": admin.email,
                "role": UserRole.ADMIN,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": False,
            },
        ],
        "total": 3,
        "page": 1,
        "size": 20,
        "pages": 1,
        "has_next": False,
        "has_prev": False,
        "next_page": None,
        "prev_page": None,
    }


async def test_admin_get_users_include_guests(db_session, admin, admin_client):
    create_user("test1@domain.com", UserRole.USER, db_session)
    create_user("test2@domain.com", UserRole.USER, db_session)
    create_user("test3@domain.com", UserRole.GUEST, db_session)

    res = await admin_client.get("/admin/users", params={"show_guests": True})

    assert res.status_code == 200
    assert res.json() == {
        "items": [
            {
                "id": is_uuid_string(),
                "email": "test3@domain.com",
                "role": UserRole.GUEST,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": True,
            },
            {
                "id": is_uuid_string(),
                "email": "test2@domain.com",
                "role": UserRole.USER,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": False,
            },
            {
                "id": is_uuid_string(),
                "email": "test1@domain.com",
                "role": UserRole.USER,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": False,
            },
            {
                "id": is_uuid_string(),
                "email": admin.email,
                "role": UserRole.ADMIN,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": False,
            },
        ],
        "total": 4,
        "page": 1,
        "size": 20,
        "pages": 1,
        "has_next": False,
        "has_prev": False,
        "next_page": None,
        "prev_page": None,
    }


async def test_admin_get_users_pagination(db_session, admin, admin_client):
    create_user("test1@domain.com", UserRole.USER, db_session)
    create_user("test2@domain.com", UserRole.USER, db_session)
    create_user("test3@domain.com", UserRole.USER, db_session)

    res = await admin_client.get(
        "/admin/users",
        params={
            "page": 1,
            "size": 1,
        },
    )
    assert res.status_code == 200

    assert res.json() == {
        "items": [
            {
                "id": is_uuid_string(),
                "email": "test3@domain.com",
                "role": UserRole.USER,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": False,
            },
        ],
        "total": 4,
        "page": 1,
        "size": 1,
        "pages": 4,
        "has_next": True,
        "has_prev": False,
        "next_page": 2,
        "prev_page": None,
    }

    res = await admin_client.get(
        "/admin/users",
        params={
            "page": 4,
            "size": 1,
        },
    )
    assert res.status_code == 200

    assert res.json() == {
        "items": [
            {
                "id": is_uuid_string(),
                "email": admin.email,
                "role": UserRole.ADMIN,
                "auth_provider": AuthProviders.PASSWORD,
                "created_at": is_utc_isoformat_string(),
                "updated_at": is_utc_isoformat_string(),
                "is_guest": False,
            },
        ],
        "total": 4,
        "page": 4,
        "size": 1,
        "pages": 4,
        "has_next": False,
        "has_prev": True,
        "next_page": None,
        "prev_page": 3,
    }


async def test_admin_get_users_as_non_admin_returns_403(
    db_session, client, user_client
):
    res = await user_client.get("/admin/users")
    assert res.status_code == 403

    res = await client.get("/admin/users")
    assert res.status_code == 403
