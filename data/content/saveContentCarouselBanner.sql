IF EXISTS(SELECT * FROM patois_config_content_carousel_banner WHERE order_no = @order_no)
  BEGIN
    -- update
    UPDATE patois_config_content_carousel_banner
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
    INSERT INTO patois_config_content_carousel_banner (title,
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
cth.content_carousel_banner_id,
cth.title,
cth.content_url,
cth.order_no,
images.[fileName] as [image_list],
images.[description] as [image_url],
images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
FROM [dbo].[patois_config_content_carousel_banner] cth WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_content] ct WITH (NOLOCK) on cth.content_id = ct.content_id
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ct.images_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ct.images_id_desktop = images_desktop.images_id
WHERE cth.order_no = @order_no
