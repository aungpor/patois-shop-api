IF(@text = '')
  BEGIN
    -- count
    SELECT COUNT(*) as total
    FROM patois_content_sub_category sc WITH (NOLOCK)
    WHERE sc.active = 1
    -- list
    SELECT
    sc.content_sub_category_id,
    sc.sub_category_name,
    sc.sub_category_desc,
    (SELECT COUNT(*) FROM patois_content c WITH (NOLOCK) WHERE c.content_sub_category_id = sc.content_sub_category_id) AS content_assignment,
    (SELECT category_name FROM patois_content_category cc WITH (NOLOCK) WHERE cc.content_category_id = sc.content_category_id) AS categories_assignment
    FROM patois_content_sub_category sc WITH (NOLOCK)
    WHERE sc.active = 1
    ORDER BY sc.sub_category_name ASC
    OFFSET (@PageNumber-1)*@RowsOfPage ROWS
    FETCH NEXT @RowsOfPage ROWS ONLY
  END
ELSE
  BEGIN
    -- count
    SELECT COUNT(*) as total
    FROM patois_content_sub_category sc WITH (NOLOCK)
    WHERE sc.active = 1
    AND (sc.sub_category_name LIKE CONCAT('%',@text ,'%') OR sc.content_sub_category_id  LIKE CONCAT('%',@text ,'%'))
    -- list
    SELECT
    sc.content_sub_category_id,
    sc.sub_category_name,
    sc.sub_category_desc,
    (SELECT COUNT(*) FROM patois_content c WITH (NOLOCK) WHERE c.content_sub_category_id = sc.content_sub_category_id) AS content_assignment,
    (SELECT category_name FROM patois_content_category cc WITH (NOLOCK) WHERE cc.content_category_id = sc.content_category_id) AS categories_assignment
    FROM patois_content_sub_category sc WITH (NOLOCK)
    WHERE sc.active = 1
    AND (sc.sub_category_name LIKE CONCAT('%',@text ,'%') OR sc.content_sub_category_id  LIKE CONCAT('%',@text ,'%'))
    ORDER BY sc.sub_category_name ASC
    OFFSET (@PageNumber-1)*@RowsOfPage ROWS
    FETCH NEXT @RowsOfPage ROWS ONLY
  END