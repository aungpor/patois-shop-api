INSERT INTO dbo.wongnok_post_review
(user_id, shop_id, review, images_id, created_at, updated_at, Quality, active, ip_address, device)
VALUES(@user_id, @shop_id, @review, @images_id, getdate(), getdate(), @quality, @active, @ipAddress, @device);
SELECT SCOPE_IDENTITY() AS postReviewId