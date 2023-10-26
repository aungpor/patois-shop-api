SELECT content_category_id, category_name, category_desc
FROM dbo.patois_content_category
WHERE content_category_id = @content_category_id 
AND active = 1