SELECT wpr.post_review_id, 
wpr.user_id, 
wpr.shop_id, 
wpr.review, 
wpr.images_id, 
wpr.created_at, 
wpr.updated_at,
u.name,
u.profile_pic_line,
u.profile_pic_patois,
u.user_type,
(select cfg.config_values from patois_config cfg where u.user_type = 'INFLUENCER' and cfg.config_name = 'influencer_icon' ) as user_type_icon,
isnull(wrs.cleanliness,0) cleanliness,
isnull(wrs.delicious,0) delicious,
isnull(wrs.pricing,0) pricing,
isnull(wrs.[service],0) [service],
isnull(wrs.atmosphere,0) atmosphere,
isnull(wrs.total,0) total,
pi2.fileName as image_list,
pi2.description as image_url,
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = pi2.images_id) as image_list_thumbnail,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = pi2.images_id) as image_url_thumbnail,
wprl.post_review_like_id,
cast(case when wprl.post_review_like_id is null then 0 else 1 end as bit) as post_review_love,
(SELECT count(*) FROM wongnok_post_review_like where post_review_id = wpr.post_review_id) as post_review_like_count,
(select (
       ( select count(*) from wongnok_post_review_comment WITH (NOLOCK)  where post_review_id = wpr.post_review_id and active != 0)+
       ( select count(*) from wongnok_post_comment_reply WITH (NOLOCK)  where comment_id in ( select comment_id from wongnok_post_review_comment WITH (NOLOCK)  where post_review_id = wpr.post_review_id and active != 0) )
)) as comment_count,
'shop' as types,
IIF(wpr.post_review_id=(select min(post_review_id) from wongnok_post_review WITH (NOLOCK)  where shop_id  = @shop_id)  ,'Y','N') as is_create_shop
FROM dbo.wongnok_post_review wpr WITH (NOLOCK) 
left join users u WITH (NOLOCK) on u.id = wpr.user_id 
left join wongnok_review_score wrs WITH (NOLOCK) on wrs.user_id = wpr.user_id  and wrs.shop_id = wpr.shop_id and wrs.post_review_id = wpr.post_review_id
left join patois_images pi2 WITH (NOLOCK) on pi2.images_id = wpr.images_id 
left join wongnok_post_review_like wprl WITH (NOLOCK) on wprl.post_review_id = wpr.post_review_id and wprl.shop_id = wpr.shop_id and wprl.user_id = @user_id
where wpr.shop_id = @shop_id 
and (wpr.active != 0)
order by wpr.created_at desc