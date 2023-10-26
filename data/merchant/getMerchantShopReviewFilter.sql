SELECT 
u.profile_pic_line,
u.profile_pic_patois,
u.name,
(select cfg.config_values from patois_config cfg where u.user_type = 'INFLUENCER' and cfg.config_name = 'influencer_icon' ) as user_type_icon,
u.user_type,
wpr.created_at, 
wpr.updated_at,
wpr.user_id, 
wpr.post_review_id, 
wpr.shop_id, 
isnull(wrs.cleanliness,0) cleanliness,
isnull(wrs.delicious,0) delicious,
isnull(wrs.pricing,0) pricing,
isnull(wrs.[service],0) [service],
isnull(wrs.atmosphere,0) atmosphere,
isnull(wrs.total,0) total,
wpr.images_id, 
pi2.fileName as image_list,
pi2.description as image_url,
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = pi2.images_id) as image_list_thumbnail,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = pi2.images_id) as image_url_thumbnail,
wpr.review
FROM dbo.wongnok_post_review wpr WITH (NOLOCK) 
left join users u WITH (NOLOCK) on u.id = wpr.user_id 
left join wongnok_review_score wrs WITH (NOLOCK) on wrs.user_id = wpr.user_id  and wrs.shop_id = wpr.shop_id and wrs.post_review_id = wpr.post_review_id
left join patois_images pi2 WITH (NOLOCK) on pi2.images_id = wpr.images_id 
where wpr.shop_id = @shop_id 
and wpr.active = 1
and (
       @score = 0 and FLOOR(wrs.total) in (1,2,3,4,5) -- 0 คือ get review all
       or
       @score <> 0 and FLOOR(wrs.total) = @score -- get review ตาม score
)
order by
case when @sort = 'desc' then wpr.created_at end desc,
case when @sort = 'asc' then wpr.created_at end asc

OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY	