BEGIN
    SELECT count(*) as count FROM wongnok_shop ws WITH (NOLOCK) 
    WHERE ws.store_type = 'merchant_shop'
    AND ws.user_id = @user_id
    AND ws.active != 0
END;

BEGIN
    SELECT  ws.shop_id,
    ws.shopName,
    ws.shop_branch_name,
    isnull((SELECT round(AVG(cast(total AS DECIMAL(7,1))),1) total FROM wongnok_review_score wrs WITH (NOLOCK) WHERE wrs.shop_id = ws.shop_id group by wrs.shop_id) ,0) AS score,
    (SELECT top 1 value FROM STRING_SPLIT(pi.fileName, ',', 1))  AS image_name,
    (SELECT top 1 value FROM STRING_SPLIT(pi.description, ',', 1))  AS image_url,
    (SELECT top 1 filename FROM patois_images_thumbnail pit WITH (NOLOCK) WHERE pit.patois_images_id = pi.images_id) AS image_name_thumbnail,
    (SELECT top 1 description FROM patois_images_thumbnail pit WITH (NOLOCK) WHERE pit.patois_images_id = pi.images_id) AS image_url_thumbnail
    FROM wongnok_shop ws WITH (NOLOCK) 
    LEFT JOIN patois_images pi WITH (NOLOCK) ON pi.images_id = ws.images_id 
    WHERE ws.store_type = 'merchant_shop'
    AND ws.user_id = @user_id
    AND ws.active != 0
    ORDER BY ws.shop_id DESC

    OFFSET (@PageNumber-1)*@RowsOfPage ROWS
    FETCH NEXT @RowsOfPage ROWS ONLY
END;