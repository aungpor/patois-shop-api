UPDATE users
SET groups_id = @groups_id
WHERE id = @userId;