SELECT content_category_id, category_name, category_desc
FROM patois_content_category WITH (NOLOCK)
WHERE active = 1
ORDER BY category_name ASC