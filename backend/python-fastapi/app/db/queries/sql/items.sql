-- name: add-item-to-favorites!
INSERT INTO favorites (user_id, item_id)
VALUES ((SELECT id FROM users WHERE username = :username),
        (SELECT id FROM items WHERE slug = :slug))
ON CONFLICT DO NOTHING;


-- name: remove-item-from-favorites!
DELETE
FROM favorites
WHERE user_id = (SELECT id FROM users WHERE username = :username)
  AND item_id = (SELECT id FROM items WHERE slug = :slug);


-- name: is-item-in-favorites^
SELECT CASE WHEN count(user_id) > 0 THEN TRUE ELSE FALSE END AS favorited
FROM favorites
WHERE user_id = (SELECT id FROM users WHERE username = :username)
  AND item_id = (SELECT id FROM items WHERE slug = :slug);


-- name: get-favorites-count-for-item^
SELECT count(*) as favorites_count
FROM favorites
WHERE item_id = (SELECT id FROM items WHERE slug = :slug);


-- name: get-tags-for-item-by-slug
SELECT t.tag
FROM tags t
         INNER JOIN items_to_tags att ON
        t.tag = att.tag
        AND
        att.item_id = (SELECT id FROM items WHERE slug = :slug);


-- name: get-item-by-slug^
SELECT id,
       slug,
       title,
       description,
       body,
       created_at,
       updated_at,
       (SELECT username FROM users WHERE id = author_id) AS author_username
FROM items
WHERE slug = :slug
LIMIT 1;


-- name: create-new-item<!
WITH author_subquery AS (
    SELECT id, username
    FROM users
    WHERE username = :author_username
)
INSERT
INTO items (slug, title, description, body, author_id)
VALUES (:slug, :title, :description, :body, (SELECT id FROM author_subquery))
RETURNING
    id,
    slug,
    title,
    description,
    body,
        (SELECT username FROM author_subquery) as author_username,
    created_at,
    updated_at;


-- name: add-tags-to-item*!
INSERT INTO items_to_tags (item_id, tag)
VALUES ((SELECT id FROM items WHERE slug = :slug),
        (SELECT tag FROM tags WHERE tag = :tag))
ON CONFLICT DO NOTHING;


-- name: update-item<!
UPDATE items
SET slug        = :new_slug,
    title       = :new_title,
    body        = :new_body,
    description = :new_description
WHERE slug = :slug
  AND author_id = (SELECT id FROM users WHERE username = :author_username)
RETURNING updated_at;


-- name: delete-item!
DELETE
FROM items
WHERE slug = :slug
  AND author_id = (SELECT id FROM users WHERE username = :author_username);


-- name: get-items-for-feed
SELECT a.id,
       a.slug,
       a.title,
       a.description,
       a.body,
       a.created_at,
       a.updated_at,
       (
           SELECT username
           FROM users
           WHERE id = a.author_id
       ) AS author_username
FROM items a
         INNER JOIN followers_to_followings f ON
        f.following_id = a.author_id AND
        f.follower_id = (SELECT id FROM users WHERE username = :follower_username)
ORDER BY a.created_at
LIMIT :limit
OFFSET
:offset;
