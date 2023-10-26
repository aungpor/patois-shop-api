UPDATE  patois_content_category
SET active = 0
WHERE content_category_id = @content_category_id

SELECT content_category_id, category_name, category_desc, active
FROM dbo.patois_content_category
WHERE content_category_id = @content_category_id