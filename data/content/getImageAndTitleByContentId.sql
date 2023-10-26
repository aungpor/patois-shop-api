SELECT 
ct.content_name as title,
ct.images_id,
images.[fileName] as [image_list],
images.[description] as [image_url],
ct.images_id_desktop,
images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
FROM [dbo].[patois_content] ct WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ct.images_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ct.images_id_desktop = images_desktop.images_id
WHERE ct.content_id = @content_id