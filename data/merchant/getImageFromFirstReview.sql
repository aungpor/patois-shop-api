SELECT top 1
wpr.images_id, 
pi2.fileName as image_list,
pi2.description as image_url,
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = pi2.images_id) as image_list_thumbnail,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = pi2.images_id) as image_url_thumbnail
FROM dbo.wongnok_post_review wpr WITH (NOLOCK) 
left join patois_images pi2 WITH (NOLOCK) on pi2.images_id = wpr.images_id 
where wpr.shop_id = @shop_id and wpr.images_id is not null
and (wpr.active != 0)
order by wpr.created_at