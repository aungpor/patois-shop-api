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
order by cth.order_no

OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY