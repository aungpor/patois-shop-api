SELECT content_sub_category_id,
sub_category_name,
sub_category_desc
FROM patois_content_sub_category WITH (NOLOCK)
WHERE active = @active
ORDER BY sub_category_name ASC