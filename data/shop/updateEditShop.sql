UPDATE dbo.wongnok_shop
SET location_id=@location_id, 
shopName=@shopName,
shopNameEN=@shopNameEN,
shop_branch_name=@shop_branch_name,
shopType_id=@shopType_id, 
foodType_id=@foodType_id, 
opening_time=@opening_time, 
recommend=@recommend,
images_id=@images_id,
remark=@remark, 
owner_id=null, 
user_id_edit=@user_id_edit, 
parkinglot_id=null, 
updated_at=getdate(), 
shopweekday_id=@shopweekday_id, 
closing_time=@closing_time, 
view_count=@view_count, 
price_range=@price_range, 
tel=@tel, 
opendatetime_id=@opendatetime_id, 
foodType_other=@foodType_other
WHERE shop_id=@shop_id

SELECT shop_id, location_id, shopName, shopType_id, foodType_id, opening_time, recommend, images_id, remark, owner_id, user_id, parkinglot_id, created_at, updated_at, shopsize_id, shopweekday_id, closing_time, view_count, price_range, tel, opendatetime_id, foodType_other, interface_from
FROM dbo.wongnok_shop WITH (NOLOCK) 
WHERE shop_id=@shop_id
