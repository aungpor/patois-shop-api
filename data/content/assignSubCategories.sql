UPDATE patois_content_sub_category
SET content_category_id = @content_category_id,
active = 1,
update_date = getDate()
WHERE content_sub_category_id = @content_sub_category_id


SELECT * 
FROM patois_content_sub_category 
WHERE content_sub_category_id = @content_sub_category_id