UPDATE patois_content
SET active = 0
WHERE content_sub_category_id = @content_sub_category_id

SELECT content_id, content_sub_category_id, active
FROM patois_content
WHERE content_sub_category_id = @content_sub_category_id
AND active = 0