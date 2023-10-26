IF(@text = '')
  BEGIN
    SELECT COUNT(*) as total
    FROM patois_content_category WITH (NOLOCK)
    WHERE active = 1

    SELECT 
    content_category_id,
    category_name,
    category_desc
    FROM patois_content_category WITH (NOLOCK)
    WHERE active = 1
    ORDER BY category_name ASC
    OFFSET (@PageNumber-1)*@RowsOfPage ROWS
    FETCH NEXT @RowsOfPage ROWS ONLY
  END
ELSE
  BEGIN
    SELECT COUNT(*) as total
    FROM patois_content_category WITH (NOLOCK)
    WHERE active = 1
    AND (category_name LIKE CONCAT('%',@text ,'%') OR content_category_id  LIKE CONCAT('%',@text ,'%'))

    SELECT
    content_category_id,
    category_name,
    category_desc
    FROM patois_content_category WITH (NOLOCK) 
    WHERE active = 1
    AND (category_name LIKE CONCAT('%',@text ,'%') OR content_category_id  LIKE CONCAT('%',@text ,'%'))
    ORDER BY category_name ASC
    OFFSET (@PageNumber-1)*@RowsOfPage ROWS
    FETCH NEXT @RowsOfPage ROWS ONLY
  END