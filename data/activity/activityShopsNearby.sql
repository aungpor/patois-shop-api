select 
--activity.[sid] as sid, 
shop.shop_id as sid ,
shop.shopName title ,
images.[fileName] as [imageSrc],
images.[description] as [imageDescription],
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th  WITH (NOLOCK)  where th.patois_images_id = shop.images_id) as images_thumbnail_fileName,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th  WITH (NOLOCK)  where th.patois_images_id = shop.images_id) as images_thumbnail_description,
--activity.cntHit, 
0 as cntHit,
--isnull([score].total,0) score,
(select round(AVG(cast(total as DECIMAL(7,1))),1) total from wongnok_review_score wrs  WITH (NOLOCK) where wrs.shop_id=shop.shop_id group by wrs.shop_id) as score,
--(case when round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)),2) >= 1000 then 
  --concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))/1000,2),' กม.') else
  --concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)),2),' เมตร')
  --end
--) AS [desc],

concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))/1000,2),' กิโลเมตร') AS [desc],
geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)) AS distance,
--activity.[types]
'shop' as types
from /*(
SELECT [sid],[types], count(activity_id) cntHit
FROM dbo.patois_activity_log WITH (NOLOCK) 
where types = 'shop'
and updated_at  >= DATEADD(month, -12, getdate())
group by [sid],[types]
) activity*/
--left join  [dbo].[wongnok_shop] shop WITH (NOLOCK) on [sid] = shop.shop_id  and (shop.active != 0)
[dbo].[wongnok_shop] shop WITH (NOLOCK)  
left join [dbo].[patois_images] images WITH (NOLOCK) on shop.images_id = images.images_id
inner join [wongnok_location] loc WITH (NOLOCK) on loc.[location_id] = [shop].[location_id]
/*left join (
      select shop_id,round(AVG(cast(total as DECIMAL(7,1))),1) total
	  from wongnok_review_score  WITH (NOLOCK) 
	  group by shop_id
 ) [score] on [shop].shop_id = [score].shop_id*/
where (shop.active != 0) 
and EXISTS(select 1 from [dbo].[patois_activity_log] al WITH (NOLOCK)  where shop.shop_id = al.[sid] and al.updated_at  >= DATEADD(month, -12, getdate() ))
and (geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)) < 5000) 
order by geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))

 OFFSET (@PageNumber-1)*@RowsOfPage ROWS
 FETCH NEXT @RowsOfPage ROWS ONLY	