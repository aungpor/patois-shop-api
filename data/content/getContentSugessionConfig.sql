SELECT 
 ct.content_id
, ct.content_name
, ct.images_id
, ct.short_desc
, ct.active as content_active
, ct.create_date
, ct.create_by
, ct.update_date
, ct.update_by
, cth.order_no
, cth.active
, ct.approve
,images.[fileName] as [image_list],
images.[description] as [image_url]
,ct.images_id_desktop
,images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
FROM [dbo].[patois_config_sugession_content] cth WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_content] ct WITH (NOLOCK) on cth.content_id = ct.content_id
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ct.images_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ct.images_id_desktop = images_desktop.images_id
where cth.active = 1
and ct.active = 1
and ct.approve = 1

order by cth.order_no

OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY	