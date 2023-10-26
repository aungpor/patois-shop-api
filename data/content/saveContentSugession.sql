IF EXISTS(SELECT * FROM patois_config_sugession_content WHERE order_no = @order_no)
  BEGIN
    -- update
    UPDATE patois_config_sugession_content
    SET title = @title,
    content_url = @content_url,
    content_id = @content_id,
    update_date = getDate(),
    update_by = @update_by
    WHERE order_no = @order_no;    
  END
ELSE
  BEGIN
    -- create
    INSERT INTO patois_config_sugession_content (title,
        content_url,
        content_id,
        order_no,
        active,
        create_date,
        update_date,
        create_by,
        update_by
    )
    VALUES (@title,
        @content_url,
        @content_id, 
        @order_no,
        @active,
        getDate(),
        getDate(),
        @create_by,
        @update_by
    );
  END



SELECT 
csc.sugession_content_id,
csc.title,
csc.content_url,
csc.order_no,
images.[fileName] as [image_list],
images.[description] as [image_url],
images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
FROM [dbo].[patois_config_sugession_content] csc WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_content] ct WITH (NOLOCK) on csc.content_id = ct.content_id
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ct.images_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ct.images_id_desktop = images_desktop.images_id
WHERE csc.order_no = @order_no