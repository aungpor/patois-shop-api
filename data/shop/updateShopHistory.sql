UPDATE dbo.patois_shop_history
SET types=@types, details=@details, updated_at=getdate(), updated_by=@updated_by, from_to=@from_to
WHERE [id]=@id

SELECT id, types, details, created_at, updated_at, created_by, updated_by, from_to
FROM dbo.patois_shop_history WITH (NOLOCK) 
WHERE [id]=@id
