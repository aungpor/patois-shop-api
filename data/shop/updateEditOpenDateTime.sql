UPDATE dbo.wongnok_opendatetime
SET updated_at=getdate(), updated_by=@updated_by, shop_id=@shop_id, active=0
WHERE opendatetime_id=@opendatetime_id

-- SELECT opendatetime_id, created_at, updated_at, created_by, updated_by, shop_id, active
-- FROM dbo.wongnok_opendatetime WITH (NOLOCK) 
-- WHERE opendatetime_id=@opendatetime_id
