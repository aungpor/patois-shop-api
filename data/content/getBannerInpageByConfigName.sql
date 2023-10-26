SELECT 
ib.image_branner_in_page_config_id
,ib.config_name
,ib.config_image_id
,ib.config_image_id_desktop
,ib.active
,images.[fileName] as [image_list],
images.[description] as [image_url]
,images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
FROM [dbo].[patois_config_image_branner_in_page] ib WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ib.config_image_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ib.config_image_id_desktop = images_desktop.images_id
where ib.config_name = @config_name
and ib.active = 1