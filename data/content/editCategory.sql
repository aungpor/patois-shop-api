UPDATE patois_content_category
SET category_name = @category_name,
update_date = getDate()
WHERE content_category_id = @content_category_id

SELECT content_category_id, category_name, category_desc, update_date, update_by
FROM patois_content_category
WHERE content_category_id = @content_category_id