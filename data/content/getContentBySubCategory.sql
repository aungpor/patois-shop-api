
SELECT 
--cs.section_name,cs.content_section_id,c.category_name,c.content_category_id,s.sub_category_name, s.content_sub_category_id,
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
--,(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = ct.images_id) as image_list_thumbnail,
--(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = ct.images_id) as image_url_thumbnail
,ct.images_id_desktop
,images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
--,(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = ct.images_id_desktop) as image__desktoplist_thumbnail,
--(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = ct.images_id_desktop) as image_desktop_url_thumbnail
FROM [dbo].[patois_content] ct WITH (NOLOCK) 
--LEFT JOIN dbo.patois_content_sub_category s WITH (NOLOCK)  on s.content_sub_category_id = ct.content_sub_category_id
--LEFT JOIN dbo.patois_content_category c WITH (NOLOCK)  on s.content_category_id = c.content_category_id
--LEFT JOIN dbo.patois_content_section cs WITH (NOLOCK)  on c.content_section_id = cs.content_section_id
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ct.images_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ct.images_id_desktop = images_desktop.images_id

where ct.content_sub_category_id = @subCatId 
and CONVERT(DATETIME,dateadd(HOUR, 7, getdate()),101) >= CONVERT(DATETIME,dateadd(HOUR, 7, ct.start_date),101)
and CONVERT(DATETIME,dateadd(HOUR, 7, getdate()),101) <= CONVERT(DATETIME,dateadd(HOUR, 7, ct.end_date),101)
and ct.active = 1 and ct.approve = 1
order by ct.create_date desc
OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY	