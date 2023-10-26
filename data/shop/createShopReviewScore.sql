INSERT INTO dbo.wongnok_review_score
(user_id, shop_id, cleanliness, delicious, pricing, total, created_at, updated_at,post_review_id, [service], atmosphere)
VALUES(@user_id, @shop_id, @cleanliness, @delicious, @pricing, @total, getdate(), getdate(),@post_review_id, @service, @atmosphere);
SELECT SCOPE_IDENTITY() AS reviewScoreId