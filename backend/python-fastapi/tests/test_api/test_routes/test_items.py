import pytest
from asyncpg.pool import Pool
from fastapi import FastAPI
from httpx import AsyncClient
from starlette import status

from app.db.errors import EntityDoesNotExist
from app.db.repositories.items import ItemsRepository
from app.db.repositories.profiles import ProfilesRepository
from app.db.repositories.users import UsersRepository
from app.models.domain.items import Item
from app.models.domain.users import UserInDB
from app.models.schemas.items import ItemInResponse, ListOfItemsInResponse

pytestmark = pytest.mark.asyncio


async def test_user_can_not_create_item_with_duplicated_slug(
    app: FastAPI, authorized_client: AsyncClient, test_item: Item
) -> None:
    item_data = {
        "title": "Test Slug",
        "body": "does not matter",
        "description": "¯\\_(ツ)_/¯",
    }
    response = await authorized_client.post(
        app.url_path_for("items:create-item"), json={"item": item_data}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


async def test_user_can_create_item(
    app: FastAPI, authorized_client: AsyncClient, test_user: UserInDB
) -> None:
    item_data = {
        "title": "Test Slug",
        "body": "does not matter",
        "description": "¯\\_(ツ)_/¯",
    }
    response = await authorized_client.post(
        app.url_path_for("items:create-item"), json={"item": item_data}
    )
    item = ItemInResponse(**response.json())
    assert item.item.title == item_data["title"]
    assert item.item.seller.username == test_user.username


async def test_not_existing_tags_will_be_created_without_duplication(
    app: FastAPI, authorized_client: AsyncClient, test_user: UserInDB
) -> None:
    item_data = {
        "title": "Test Slug",
        "body": "does not matter",
        "description": "¯\\_(ツ)_/¯",
        "tagList": ["tag1", "tag2", "tag3", "tag3"],
    }
    response = await authorized_client.post(
        app.url_path_for("items:create-item"), json={"item": item_data}
    )
    item = ItemInResponse(**response.json())
    assert set(item.item.tags) == {"tag1", "tag2", "tag3"}


@pytest.mark.parametrize(
    "api_method, route_name",
    (("GET", "items:get-item"), ("PUT", "items:update-item")),
)
async def test_user_can_not_retrieve_not_existing_item(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_item: Item,
    api_method: str,
    route_name: str,
) -> None:
    response = await authorized_client.request(
        api_method, app.url_path_for(route_name, slug="wrong-slug")
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


async def test_user_can_retrieve_item_if_exists(
    app: FastAPI, authorized_client: AsyncClient, test_item: Item
) -> None:
    response = await authorized_client.get(
        app.url_path_for("items:get-item", slug=test_item.slug)
    )
    item = ItemInResponse(**response.json())
    assert item.item == test_item


@pytest.mark.parametrize(
    "update_field, update_value, extra_updates",
    (
        ("title", "New Title", {"slug": "new-title"}),
        ("description", "new description", {}),
        ("body", "new body", {}),
    ),
)
async def test_user_can_update_item(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_item: Item,
    update_field: str,
    update_value: str,
    extra_updates: dict,
) -> None:
    response = await authorized_client.put(
        app.url_path_for("items:update-item", slug=test_item.slug),
        json={"item": {update_field: update_value}},
    )

    assert response.status_code == status.HTTP_200_OK

    item = ItemInResponse(**response.json()).item
    item_as_dict = item.dict()
    assert item_as_dict[update_field] == update_value

    for extra_field, extra_value in extra_updates.items():
        assert item_as_dict[extra_field] == extra_value

    exclude_fields = {update_field, *extra_updates.keys(), "updated_at"}
    assert item.dict(exclude=exclude_fields) == test_item.dict(
        exclude=exclude_fields
    )


@pytest.mark.parametrize(
    "api_method, route_name",
    (("PUT", "items:update-item"), ("DELETE", "items:delete-item")),
)
async def test_user_can_not_modify_item_that_is_not_sold_by_him(
    app: FastAPI,
    authorized_client: AsyncClient,
    pool: Pool,
    api_method: str,
    route_name: str,
) -> None:
    async with pool.acquire() as connection:
        users_repo = UsersRepository(connection)
        user = await users_repo.create_user(
            username="test_seller", email="seller@email.com", password="password"
        )
        items_repo = ItemsRepository(connection)
        await items_repo.create_item(
            slug="test-slug",
            title="Test Slug",
            description="Slug for tests",
            body="Test " * 100,
            seller=user,
            tags=["tests", "testing", "pytest"],
        )

    response = await authorized_client.request(
        api_method,
        app.url_path_for(route_name, slug="test-slug"),
        json={"item": {"title": "Updated Title"}},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


async def test_user_can_delete_his_item(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_item: Item,
    pool: Pool,
) -> None:
    await authorized_client.delete(
        app.url_path_for("items:delete-item", slug=test_item.slug)
    )

    async with pool.acquire() as connection:
        items_repo = ItemsRepository(connection)
        with pytest.raises(EntityDoesNotExist):
            await items_repo.get_item_by_slug(slug=test_item.slug)


@pytest.mark.parametrize(
    "api_method, route_name, favorite_state",
    (
        ("POST", "items:mark-item-favorite", True),
        ("DELETE", "items:unmark-item-favorite", False),
    ),
)
async def test_user_can_change_favorite_state(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_item: Item,
    test_user: UserInDB,
    pool: Pool,
    api_method: str,
    route_name: str,
    favorite_state: bool,
) -> None:
    if not favorite_state:
        async with pool.acquire() as connection:
            items_repo = ItemsRepository(connection)
            await items_repo.add_item_into_favorites(
                item=test_item, user=test_user
            )

    await authorized_client.request(
        api_method, app.url_path_for(route_name, slug=test_item.slug)
    )

    response = await authorized_client.get(
        app.url_path_for("items:get-item", slug=test_item.slug)
    )

    item = ItemInResponse(**response.json())

    assert item.item.favorited == favorite_state
    assert item.item.favorites_count == int(favorite_state)


@pytest.mark.parametrize(
    "api_method, route_name, favorite_state",
    (
        ("POST", "items:mark-item-favorite", True),
        ("DELETE", "items:unmark-item-favorite", False),
    ),
)
async def test_user_can_not_change_item_state_twice(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_item: Item,
    test_user: UserInDB,
    pool: Pool,
    api_method: str,
    route_name: str,
    favorite_state: bool,
) -> None:
    if favorite_state:
        async with pool.acquire() as connection:
            items_repo = ItemsRepository(connection)
            await items_repo.add_item_into_favorites(
                item=test_item, user=test_user
            )

    response = await authorized_client.request(
        api_method, app.url_path_for(route_name, slug=test_item.slug)
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


async def test_empty_feed_if_user_has_not_followings(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_item: Item,
    test_user: UserInDB,
    pool: Pool,
) -> None:
    async with pool.acquire() as connection:
        users_repo = UsersRepository(connection)
        items_repo = ItemsRepository(connection)

        for i in range(5):
            user = await users_repo.create_user(
                username=f"user-{i}", email=f"user-{i}@email.com", password="password"
            )
            for j in range(5):
                await items_repo.create_item(
                    slug=f"slug-{i}-{j}",
                    title="tmp",
                    description="tmp",
                    body="tmp",
                    seller=user,
                    tags=[f"tag-{i}-{j}"],
                )

    response = await authorized_client.get(
        app.url_path_for("items:get-user-feed-items")
    )

    items = ListOfItemsInResponse(**response.json())
    assert items.items == []


async def test_user_will_receive_only_following_items(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_item: Item,
    test_user: UserInDB,
    pool: Pool,
) -> None:
    following_seller_username = "user-2"
    async with pool.acquire() as connection:
        users_repo = UsersRepository(connection)
        profiles_repo = ProfilesRepository(connection)
        items_repo = ItemsRepository(connection)

        for i in range(5):
            user = await users_repo.create_user(
                username=f"user-{i}", email=f"user-{i}@email.com", password="password"
            )
            if i == 2:
                await profiles_repo.add_user_into_followers(
                    target_user=user, requested_user=test_user
                )

            for j in range(5):
                await items_repo.create_item(
                    slug=f"slug-{i}-{j}",
                    title="tmp",
                    description="tmp",
                    body="tmp",
                    seller=user,
                    tags=[f"tag-{i}-{j}"],
                )

    response = await authorized_client.get(
        app.url_path_for("items:get-user-feed-items")
    )

    items_from_response = ListOfItemsInResponse(**response.json())
    assert len(items_from_response.items) == 5

    all_from_following = (
        item.seller.username == following_seller_username
        for item in items_from_response.items
    )
    assert all(all_from_following)


async def test_user_receiving_feed_with_limit_and_offset(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_item: Item,
    test_user: UserInDB,
    pool: Pool,
) -> None:
    async with pool.acquire() as connection:
        users_repo = UsersRepository(connection)
        profiles_repo = ProfilesRepository(connection)
        items_repo = ItemsRepository(connection)

        for i in range(5):
            user = await users_repo.create_user(
                username=f"user-{i}", email=f"user-{i}@email.com", password="password"
            )
            if i == 2:
                await profiles_repo.add_user_into_followers(
                    target_user=user, requested_user=test_user
                )

            for j in range(5):
                await items_repo.create_item(
                    slug=f"slug-{i}-{j}",
                    title="tmp",
                    description="tmp",
                    body="tmp",
                    seller=user,
                    tags=[f"tag-{i}-{j}"],
                )

    full_response = await authorized_client.get(
        app.url_path_for("items:get-user-feed-items")
    )
    full_items = ListOfItemsInResponse(**full_response.json())

    response = await authorized_client.get(
        app.url_path_for("items:get-user-feed-items"),
        params={"limit": 2, "offset": 3},
    )

    items_from_response = ListOfItemsInResponse(**response.json())
    assert full_items.items[3:] == items_from_response.items


async def test_item_will_contain_only_attached_tags(
    app: FastAPI, authorized_client: AsyncClient, test_user: UserInDB, pool: Pool
) -> None:
    attached_tags = ["tag1", "tag3"]

    async with pool.acquire() as connection:
        items_repo = ItemsRepository(connection)

        await items_repo.create_item(
            slug=f"test-slug",
            title="tmp",
            description="tmp",
            body="tmp",
            seller=test_user,
            tags=attached_tags,
        )

        for i in range(5):
            await items_repo.create_item(
                slug=f"slug-{i}",
                title="tmp",
                description="tmp",
                body="tmp",
                seller=test_user,
                tags=[f"tag-{i}"],
            )

    response = await authorized_client.get(
        app.url_path_for("items:get-item", slug="test-slug")
    )
    item = ItemInResponse(**response.json())
    assert len(item.item.tags) == len(attached_tags)
    assert set(item.item.tags) == set(attached_tags)


@pytest.mark.parametrize(
    "tag, result", (("", 7), ("tag1", 1), ("tag2", 2), ("wrong", 0))
)
async def test_filtering_by_tags(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_user: UserInDB,
    pool: Pool,
    tag: str,
    result: int,
) -> None:
    async with pool.acquire() as connection:
        items_repo = ItemsRepository(connection)

        await items_repo.create_item(
            slug=f"slug-1",
            title="tmp",
            description="tmp",
            body="tmp",
            seller=test_user,
            tags=["tag1", "tag2"],
        )
        await items_repo.create_item(
            slug=f"slug-2",
            title="tmp",
            description="tmp",
            body="tmp",
            seller=test_user,
            tags=["tag2"],
        )

        for i in range(5, 10):
            await items_repo.create_item(
                slug=f"slug-{i}",
                title="tmp",
                description="tmp",
                body="tmp",
                seller=test_user,
                tags=[f"tag-{i}"],
            )

    response = await authorized_client.get(
        app.url_path_for("items:list-items"), params={"tag": tag}
    )
    items = ListOfItemsInResponse(**response.json())
    assert items.items_count == result


@pytest.mark.parametrize(
    "seller, result", (("", 8), ("seller1", 1), ("seller2", 2), ("wrong", 0))
)
async def test_filtering_by_sellers(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_user: UserInDB,
    pool: Pool,
    seller: str,
    result: int,
) -> None:
    async with pool.acquire() as connection:
        users_repo = UsersRepository(connection)
        items_repo = ItemsRepository(connection)

        seller1 = await users_repo.create_user(
            username="seller1", email="seller1@email.com", password="password"
        )
        seller2 = await users_repo.create_user(
            username="seller2", email="seller2@email.com", password="password"
        )

        await items_repo.create_item(
            slug=f"slug-1", title="tmp", description="tmp", body="tmp", seller=seller1
        )
        await items_repo.create_item(
            slug=f"slug-2-1", title="tmp", description="tmp", body="tmp", seller=seller2
        )
        await items_repo.create_item(
            slug=f"slug-2-2", title="tmp", description="tmp", body="tmp", seller=seller2
        )

        for i in range(5, 10):
            await items_repo.create_item(
                slug=f"slug-{i}",
                title="tmp",
                description="tmp",
                body="tmp",
                seller=test_user,
            )

    response = await authorized_client.get(
        app.url_path_for("items:list-items"), params={"seller": seller}
    )
    items = ListOfItemsInResponse(**response.json())
    assert items.items_count == result


@pytest.mark.parametrize(
    "favorited, result", (("", 7), ("fan1", 1), ("fan2", 2), ("wrong", 0))
)
async def test_filtering_by_favorited(
    app: FastAPI,
    authorized_client: AsyncClient,
    test_user: UserInDB,
    pool: Pool,
    favorited: str,
    result: int,
) -> None:
    async with pool.acquire() as connection:
        users_repo = UsersRepository(connection)
        items_repo = ItemsRepository(connection)

        fan1 = await users_repo.create_user(
            username="fan1", email="fan1@email.com", password="password"
        )
        fan2 = await users_repo.create_user(
            username="fan2", email="fan2@email.com", password="password"
        )

        item1 = await items_repo.create_item(
            slug=f"slug-1", title="tmp", description="tmp", body="tmp", seller=test_user
        )
        item2 = await items_repo.create_item(
            slug=f"slug-2", title="tmp", description="tmp", body="tmp", seller=test_user
        )

        await items_repo.add_item_into_favorites(item=item1, user=fan1)
        await items_repo.add_item_into_favorites(item=item1, user=fan2)
        await items_repo.add_item_into_favorites(item=item2, user=fan2)

        for i in range(5, 10):
            await items_repo.create_item(
                slug=f"slug-{i}",
                title="tmp",
                description="tmp",
                body="tmp",
                seller=test_user,
            )

    response = await authorized_client.get(
        app.url_path_for("items:list-items"), params={"favorited": favorited}
    )
    items = ListOfItemsInResponse(**response.json())
    assert items.items_count == result


async def test_filtering_with_limit_and_offset(
    app: FastAPI, authorized_client: AsyncClient, test_user: UserInDB, pool: Pool
) -> None:
    async with pool.acquire() as connection:
        items_repo = ItemsRepository(connection)

        for i in range(5, 10):
            await items_repo.create_item(
                slug=f"slug-{i}",
                title="tmp",
                description="tmp",
                body="tmp",
                seller=test_user,
            )

    full_response = await authorized_client.get(
        app.url_path_for("items:list-items")
    )
    full_items = ListOfItemsInResponse(**full_response.json())

    response = await authorized_client.get(
        app.url_path_for("items:list-items"), params={"limit": 2, "offset": 3}
    )

    items_from_response = ListOfItemsInResponse(**response.json())
    assert full_items.items[3:] == items_from_response.items
