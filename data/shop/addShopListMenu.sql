INSERT INTO dbo.patois_shop_list_menu
(shop_id, menu, review_id, created_at, updated_at, type)
VALUES(@shop_id, @menu, @review_id, getdate(), getdate(), @type)