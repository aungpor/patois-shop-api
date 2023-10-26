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
order by csc.order_no

OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY