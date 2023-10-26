select 
p.partnership_id
,p.partnership_name
,p.image_id
,p.url
,p.order_no
,p.active
,images.[fileName] as [image_list],
images.[description] as [image_url]
FROM [dbo].[patois_config_partnership] p WITH (NOLOCK) 
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on p.image_id = images.images_id
where p.active = 1
order by order_no

OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY