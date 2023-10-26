UPDATE dbo.wongnok_shop
SET history_id=@history_id
WHERE shop_id=@shop_id

SELECT shop_id, location_id, shopName, shopType_id, foodType_id, opening_time, recommend, images_id, remark, owner_id, user_id, parkinglot_id, created_at, updated_at, shopsize_id, shopweekday_id, closing_time, view_count, price_range, tel, opendatetime_id, foodType_other, interface_from, user_id_edit, history_id
FROM dbo.wongnok_shop  WITH (NOLOCK) 
WHERE shop_id=@shop_id

