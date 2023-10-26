
SELECT top 1
wpr.images_id, 
pi2.fileName as image_list,
pi2.description as image_url,
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = pi2.images_id) as image_list_thumbnail,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = pi2.images_id) as image_url_thumbnail
FROM dbo.wongnok_post_review wpr WITH (NOLOCK) 
left join patois_images pi2 WITH (NOLOCK) on pi2.images_id = wpr.images_id 
--where wpr.shop_id = @shop_id and wpr.images_id is not null

where post_review_id in(
    select  tbl.post_review_id--, max(tbl.cnt)
    from(
    select top 1 l.post_review_id, count(*) as cnt from wongnok_post_review_like l WITH (NOLOCK)  where l.post_review_id in(select pr.post_review_id from wongnok_post_review pr WITH (NOLOCK)  where pr.shop_id = @shop_id  and pr.images_id is not null and EXISTS(SELECT 1 FROM patois_images im WITH (NOLOCK)  WHERE im.images_id = pr.images_id and (fileName != '' and fileName is not null))) group by l.post_review_id
    order by cnt desc, l.post_review_id desc
    ) as tbl
    group by tbl.post_review_id
)



and (wpr.active != 0)
order by wpr.created_at
