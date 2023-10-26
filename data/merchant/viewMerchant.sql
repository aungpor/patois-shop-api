-- view merchant step 1 (shopData)
SELECT
ws.shop_id,
ws.shopName,
ws.shopNameEN,
IIF(ws.shop_branch_name IS NOT NULL, 2, 1) AS branchShop,
ws.shop_branch_name,
ws.recommend,
ws.tel
FROM wongnok_shop ws WITH (NOLOCK)
LEFT JOIN wongnok_location wl WITH (NOLOCK) ON wl.location_id = ws.location_id
WHERE ws.shop_id = @shop_id
AND ws.user_id = @user_id

-- view merchant step 2 (shopType)
SELECT
ws.foodType_id,
wf.foodTypeName,
ws.shop_eating_type_id as shopEatingTypeId,
pset.shop_eating_type_name,
ws.shopType_id,
wst.shopTypeName,
ws.opening_time,
ws.closing_time,
ws.shopweekday_id,
isnull(odt.opendatetime_id,ws.opendatetime_id) as opendatetime_id,
odt.open_time,
odt.close_time,
odt.isopen,
ws.price_range,
wpr.pricerange_text
FROM wongnok_shop ws WITH (NOLOCK)
left join wongnok_food wf WITH (NOLOCK) on wf.foodType_id = ws.foodType_id
left join patois_ms_shop_eating_type pset WITH (NOLOCK) on pset.shop_eating_type_id = ws.shop_eating_type_id
left join wongnok_shop_type wst WITH (NOLOCK) on wst.shopType_id = ws.shopType_id
left join wongnok_price_range wpr WITH (NOLOCK) on wpr.id = ws.price_range
left join (
    select wo.opendatetime_id,wo.open_time,wo.close_time,
    (case when (CONVERT(VARCHAR(5), (GETDATE() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'), 108) >= RIGHT(concat('0000',wo.open_time),5) and CONVERT(VARCHAR(5), (GETDATE() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'), 108) <= RIGHT(concat('0000',wo.close_time),5)) 
    then cast(1 as bit) else cast(0 as bit) end) as isopen
    from wongnok_opendatetimes wo  WITH (NOLOCK) 
    left join wongnok_open_weekday_criteria wowc WITH (NOLOCK) on wowc.shopweekday_id = wo.shopweekday_id 
    where wowc.shopweekday_criteria_eng = DATENAME(WEEKDAY, GETDATE())
) odt on odt.opendatetime_id = ws.opendatetime_id
WHERE ws.shop_id = @shop_id
AND ws.user_id = @user_id

-- view merchant step 3 (shopImages)
SELECT
ws.images_id,
img.fileName as image_list,
img.description as image_url,
(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK) where th.patois_images_id = ws.images_id) as image_list_thumbnail,
(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK) where th.patois_images_id = ws.images_id) as image_url_thumbnail
FROM wongnok_shop ws WITH (NOLOCK) 
left join patois_images img WITH (NOLOCK) on img.images_id = ws.images_id
WHERE ws.shop_id = @shop_id
AND ws.user_id = @user_id

-- get location
SELECT
wl.*
FROM wongnok_shop ws WITH (NOLOCK)
LEFT JOIN wongnok_location wl WITH (NOLOCK) ON wl.location_id = ws.location_id
WHERE ws.shop_id = @shop_id
AND ws.user_id = @user_id