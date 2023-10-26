SELECT [shop].shop_id,
      shop.[location_id],
      loc.location_name,
      loc.latitude,
      loc.longitude,
      loc.address,
      shop.tel as [tel],
      shop.[shopName],
      shop.[shopNameEN],
      shop.[shop_branch_name],
      shop.[shopType_id],
      shop.[foodType_id],
      shop.[opening_time],
      shop.[recommend],
      shop.[images_id],
      images.[fileName] as [image_list],
      images.[description] as [image_url],
      (SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = shop.images_id) as image_list_thumbnail,
      (SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = shop.images_id) as image_url_thumbnail,
      shop.[remark],
      shop.[owner_id],
      shop.[user_id],
      shop.[parkinglot_id],
      shop.[created_at],
      shop.[updated_at],
      shop.[shopsize_id],
      shop.[shopweekday_id],
      shop.[closing_time],
      shop.[price_range],
      shop.[shop_status_code],
      isnull(shop_size.shopsize_criteria,'') shopsize,
      wpl.post_like_id ,
      cast(case when wpl.post_like_id is null then 0 else 1 end as bit) as love,
      wps.saved_id,
      cast(case when wps.saved_id is null then 0 else 1 end as bit) as favorite,
      isnull([like].like_count,0) like_count,
      isnull([view].view_count,0) view_count,
      isnull([comment].comment_count,0) comment_count,
      isnull([score].cleanliness,0) cleanliness,
      isnull([score].delicious,0) delicious,
      isnull([score].pricing,0) pricing,
      isnull([score].[service],0) [service],
      isnull([score].atmosphere,0) atmosphere,
      isnull([score].total,0) total,
      isnull([score].cntReview,0) cntReview,
      wpr.pricerange_text,
      isnull([odt].opendatetime_id,shop.opendatetime_id) as opendatetime_id,
      [odt].open_time,
      [odt].close_time,
      [odt].isopen,
      shop.store_type as [types],
      -- 'shop' as [types],
      shop.history_id,
      shop.shop_eating_type_id,
      shop.in_campaign_type
    FROM [dbo].[wongnok_shop] shop WITH (NOLOCK) 
    left join [dbo].[wongnok_location] loc WITH (NOLOCK) on shop.location_id = loc.location_id
    left join [dbo].[patois_images] images WITH (NOLOCK) on shop.images_id = images.images_id
    left join [dbo].[wongnok_shop_size] shop_size WITH (NOLOCK) on shop.shopsize_id = shop_size.shopsize_id
  left join [dbo].[wongnok_post_like] wpl WITH (NOLOCK) on wpl.shop_id =shop.shop_id and wpl.user_id = @user_id
  left join [dbo].[wongnok_saved_shop] wps WITH (NOLOCK) on wps.shop_id = shop.shop_id and wps.user_id = @user_id
  left join [dbo].wongnok_price_range wpr WITH (NOLOCK) on wpr.id = shop.[price_range]

  left join (
	  select wo.opendatetime_id,wo.open_time,wo.close_time,
	(case when (CONVERT(VARCHAR(5), (GETDATE() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'), 108) >= RIGHT(concat('0000',wo.open_time),5) and CONVERT(VARCHAR(5), (GETDATE() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'), 108) <= RIGHT(concat('0000',wo.close_time),5)) 
	then cast(1 as bit) else cast(0 as bit) end) as isopen
	from wongnok_opendatetimes wo  WITH (NOLOCK) 
	left join wongnok_open_weekday_criteria wowc WITH (NOLOCK) on wowc.shopweekday_id = wo.shopweekday_id 
	where wowc.shopweekday_criteria_eng = DATENAME(WEEKDAY, GETDATE())
  ) [odt] on [odt].opendatetime_id = shop.opendatetime_id

    left join (
        select shop_id,count(*) as like_count from [dbo].[wongnok_post_like] WITH (NOLOCK) 
        group by shop_id
    ) [like] on [shop].shop_id = [like].shop_id
    left join (
        select shop_id,count(*) as view_count from [dbo].[wongnok_post_view] WITH (NOLOCK) 
        group by shop_id
    ) [view] on [shop].shop_id = [view].shop_id
    left join (
        select shop_id,count(*) as comment_count from [dbo].[wongnok_post_comment] WITH (NOLOCK) 
        group by shop_id
    ) [comment] on [shop].shop_id = [comment].shop_id
    left join (
      /*select shop_id, 
		AVG(cleanliness) cleanliness, 
		AVG(delicious) delicious, 
		AVG(pricing) pricing,
		AVG([service]) [service],
		AVG(atmosphere) atmosphere,
		round(AVG(cast(total as DECIMAL(7,1))),1) total,
    count(*) cntReview 
	  from wongnok_review_score  WITH (NOLOCK) 
	  group by shop_id*/

select rss.shop_id, 
		AVG(rss.cleanliness) cleanliness, 
		AVG(rss.delicious) delicious, 
		AVG(rss.pricing) pricing,
		AVG(rss.[service]) [service],
		AVG(rss.atmosphere) atmosphere,
		round(AVG(cast(rss.total as DECIMAL(7,1))),1) total,
    count(*) cntReview 
	  from wongnok_review_score rss  WITH (NOLOCK) 
-- use join
      right join wongnok_post_review prev on rss.post_review_id = prev.post_review_id and prev.active = 1
      where rss.shop_id = @shop_id
-- end use join
-- use select check
--where rss.shop_id = @shop_id and EXISTS(SELECT 1 FROM [dbo].[wongnok_post_review] prev WITH (NOLOCK)  WHERE  rss.post_review_id = prev.post_review_id and prev.active = 1 )
	  group by rss.shop_id

  ) [score] on [shop].shop_id = [score].shop_id
  WHERE shop.shop_id = @shop_id
  and (shop.active != 0)
