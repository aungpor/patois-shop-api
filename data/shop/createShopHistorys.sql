INSERT INTO dbo.patois_shop_historys
(types, details, created_at, updated_at, history_id, created_by, updated_by, from_to)
VALUES(@types, @details, getdate(), getdate(), @history_id, @created_by, @updated_by, @from_to)

SELECT SCOPE_IDENTITY() AS shopHistorysId