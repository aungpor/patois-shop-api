
select 
activity.[sid] as sid, 
shop.shopName title ,
images.[fileName] as [imageSrc],
images.[description] as [imageDescription],
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = shop.images_id) as images_thumbnail_fileName,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = shop.images_id) as images_thumbnail_description,
activity.cntHit, 
isnull([score].total,0) score,
--(case when round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)),2) >= 1000 then 
  --concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))/1000,2),' กม.') else
  --concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)),2),' เมตร')
  --end
--) AS [desc],
concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))/1000,2),' กิโลเมตร') AS [desc],
geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)) AS distance,
activity.[types],
foodType_id
from (
SELECT [shop_id] as [sid], 'shop' as [types], 1 as cntHit
FROM [dbo].[wongnok_shop] WITH (NOLOCK) 
where 1=1
 and ((@group_code =  'G001' and shop_id in (SELECT  top 20 SHOP_ID FROM [dbo].[patois_shop_top_hit_config] WHERE type = 'CUSTOMER_SHOP' and group_code =  'G001' ORDER BY NEWID()) )
    or(@group_code != 'G001' and shop_id in (SELECT  top 20 SHOP_ID FROM [dbo].[patois_shop_top_hit_config] WHERE type = 'CUSTOMER_SHOP' and group_code =  @group_code ORDER BY NEWID()))
)
--where shop_id in (SELECT SHOP_ID FROM [dbo].[patois_shop_top_hit_config] WHERE type = 'CUSTOMER_SHOP' and group_code = @group_code)
--and updated_at  >= DATEADD(month, -12, getdate())
--group by [sid],[types]
) activity
left join  [dbo].[wongnok_shop] shop WITH (NOLOCK) on [sid] = shop.shop_id  and (shop.active != 0) 
left join [dbo].[patois_images] images WITH (NOLOCK) on shop.images_id = images.images_id
inner join [wongnok_location] loc WITH (NOLOCK) on loc.[location_id] = [shop].[location_id]
left join (
      select shop_id,round(AVG(cast(total as DECIMAL(7,1))),1) total
	  from wongnok_review_score  WITH (NOLOCK) 
	  group by shop_id
 ) [score] on [shop].shop_id = [score].shop_id
 

union

select 
activity.[sid] as sid, 
shop.shop_name title ,
images.[fileName] as [imageSrc],
images.[description] as [imageDescription],
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th  WITH (NOLOCK)  where th.patois_images_id = shop.shop_image_id) as images_thumbnail_fileName,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th  WITH (NOLOCK)  where th.patois_images_id = shop.shop_image_id) as images_thumbnail_description,
activity.cntHit, 
isnull([score].total,0) score,
--(case when round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)),2) >= 1000 then 
  --concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))/1000,2),' กม.') else
  --concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)),2),' เมตร')
  --end
--) AS [desc],
concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))/1000,2),' กิโลเมตร') AS [desc],
geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)) AS distance,
activity.[types],
food_type_id
from (
SELECT [shop_id] as [sid], 'merchant_shop' as [types], 1 as cntHit
FROM [dbo].[patois_merchant_shop] WITH (NOLOCK) 
where 1=1
 and ((@group_code =  'G001' and shop_id in (SELECT  top 20 SHOP_ID FROM [dbo].[patois_shop_top_hit_config] WITH (NOLOCK)  WHERE type = 'MERCHANT_SHOP' and group_code =  'G001' ORDER BY NEWID()) )
    or(@group_code != 'G001' and shop_id in (SELECT  SHOP_ID FROM [dbo].[patois_shop_top_hit_config] WITH (NOLOCK)  WHERE type = 'MERCHANT_SHOP' and group_code =  @group_code ))
)
--where shop_id in (SELECT SHOP_ID FROM [dbo].[patois_shop_top_hit_config] WHERE type = 'MERCHANT_SHOP' and group_code = @group_code)
--and updated_at  >= DATEADD(month, -12, getdate())
--group by [sid],[types]
) activity
left join  [dbo].[patois_merchant_shop] shop WITH (NOLOCK) on [sid] = shop.shop_id  and (shop.active != 0) 
left join [dbo].[patois_images] images WITH (NOLOCK) on shop.shop_image_id = images.images_id
inner join [wongnok_location] loc WITH (NOLOCK) on loc.[location_id] = [shop].[shop_location_id]
left join (
      select shop_id,round(AVG(cast(total as DECIMAL(7,1))),1) total
	  from wongnok_review_score  WITH (NOLOCK) 
	  group by shop_id
 ) [score] on [shop].shop_id = [score].shop_id
order by cntHit desc
 OFFSET (@PageNumber-1)*@RowsOfPage ROWS
 FETCH NEXT @RowsOfPage ROWS ONLY	