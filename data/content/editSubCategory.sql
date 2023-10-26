UPDATE patois_content_sub_category
SET sub_category_name = @sub_category_name,
update_date = getDate()
WHERE content_sub_category_id = @content_sub_category_id

SELECT content_sub_category_id, sub_category_name, sub_category_desc, update_date, update_by
FROM patois_content_sub_category
WHERE content_sub_category_id = @content_sub_category_id