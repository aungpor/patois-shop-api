select 
ads.ads_banner_id
,ads.image_id
,ads.url
,ads.order_no
,ads.active
,images.[fileName] as [image_list],
images.[description] as [image_url]
,ads.image_id_desktop 
,images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
 FROM [dbo].[patois_config_ads_banner] ads WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ads.image_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ads.image_id_desktop = images_desktop.images_id
where ads.active = 1
order by ads.order_no

OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY