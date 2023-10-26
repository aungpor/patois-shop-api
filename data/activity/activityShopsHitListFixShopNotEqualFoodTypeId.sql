
select 
activity.[sid] as sid, 
shop.shopName title ,
images.[fileName] as [imageSrc],
images.[description] as [imageDescription],
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th  WITH (NOLOCK)  where th.patois_images_id = shop.images_id) as images_thumbnail_fileName,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = shop.images_id) as images_thumbnail_description,
activity.cntHit, 
isnull([score].total,0) score,
concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))/1000,2),' กิโลเมตร') AS [desc],
geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)) AS distance,
activity.[types],
foodType_id
from (
SELECT [shop_id] as [sid], 'shop' as [types], 1 as cntHit
FROM [dbo].[wongnok_shop] WITH (NOLOCK) 
where shop_id in (
  SELECT  top 20 c1.shop_id FROM [dbo].[patois_shop_top_hit_config] c1 WITH (NOLOCK) 
  inner join [dbo].[wongnok_shop] as s1 WITH (NOLOCK) on s1.shop_id = c1.shop_id and s1.foodType_id != @foodType_id
  WHERE c1.type = 'CUSTOMER_SHOP'
  and c1.group_code =  'G001'
  ORDER BY NEWID()) 
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
concat(round(geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326))/1000,2),' กิโลเมตร') AS [desc],
geography::Point(@lat, @lng, 4326).STDistance(geography::Point(latitude, longitude, 4326)) AS distance,
activity.[types],
food_type_id
from (
SELECT [shop_id] as [sid], 'merchant_shop' as [types], 1 as cntHit
FROM [dbo].[patois_merchant_shop] WITH (NOLOCK) 
where shop_id in (
  SELECT  top 20 c2.shop_id FROM [dbo].[patois_shop_top_hit_config] c2 WITH (NOLOCK) 
  inner join [dbo].[patois_merchant_shop] as s2 WITH (NOLOCK) on s2.shop_id = c2.shop_id and s2.food_type_id != @foodType_id
  WHERE c2.type = 'MERCHANT_SHOP'
  and c2.group_code =  'G001'
  ORDER BY NEWID()) 
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