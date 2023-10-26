SELECT 
 ct.content_id
, ct.content_name
, ct.images_id
, ct.short_desc
, ct.active
, ct.create_date
, ct.create_by
, ct.update_date
, ct.update_by
, ct.order_no
, ct.approve
,images.[fileName] as [image_list],
images.[description] as [image_url]
,ct.images_id_desktop
,images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
FROM [dbo].[patois_content] ct WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ct.images_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ct.images_id_desktop = images_desktop.images_id
where CONVERT(DATETIME,dateadd(HOUR, 7, getdate()),101) >= CONVERT(DATETIME,dateadd(HOUR, 7, ct.start_date),101)
and CONVERT(DATETIME,dateadd(HOUR, 7, getdate()),101) <= CONVERT(DATETIME,dateadd(HOUR, 7, ct.end_date),101)
and ct.active = 1 and ct.approve = 1
order by ct.create_date desc

OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY	