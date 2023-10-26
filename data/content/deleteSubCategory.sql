UPDATE  patois_content_sub_category
SET 
active = 0,
content_category_id = NULL
WHERE content_sub_category_id = @content_sub_category_id

SELECT content_sub_category_id, sub_category_name, sub_category_desc, update_date, active, update_by
FROM dbo.patois_content_sub_category
WHERE content_sub_category_id = @content_sub_category_id