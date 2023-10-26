INSERT INTO dbo.patois_shop_history
(types, details, created_at, updated_at, created_by, updated_by, from_to)
VALUES(@types, @details, getdate(), getdate(), @created_by, @updated_by, @from_to)

SELECT SCOPE_IDENTITY() AS shopHistoryId