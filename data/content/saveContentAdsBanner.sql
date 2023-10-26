IF EXISTS(SELECT * FROM patois_config_ads_banner WHERE order_no = @order_no)
  BEGIN
    -- update
    UPDATE patois_config_ads_banner
    SET image_id = @image_id,
    image_id_desktop = @image_id_desktop,
    url = @url,
    update_date = getDate(),
    update_by = @update_by
    WHERE order_no = @order_no;    
  END
ELSE
  BEGIN
    -- create
    INSERT INTO patois_config_ads_banner (image_id,
        image_id_desktop,
        url,
        order_no,
        active,
        create_date,
        update_date,
        create_by,
        update_by
    )
    VALUES (@image_id,
        @image_id_desktop,
        @url, 
        @order_no,
        @active,
        getDate(),
        getDate(),
        @create_by,
        @update_by
    );
  END


select 
ads.ads_banner_id,
ads.image_id,
images.[fileName] as [image_list],
images.[description] as [image_url],
ads.image_id_desktop,
images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url],
ads.url,
ads.order_no,
ads.active
FROM [dbo].[patois_config_ads_banner] ads WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ads.image_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ads.image_id_desktop = images_desktop.images_id
WHERE ads.order_no = @order_no