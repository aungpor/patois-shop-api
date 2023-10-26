SELECT count(*) AS cnuntReview, 
ISNULL(AVG(wrs.delicious), 0) AS delicious,
ISNULL(AVG(wrs.cleanliness), 0) AS cleanliness,
ISNULL(AVG(wrs.service), 0) AS service,
ISNULL(AVG(wrs.atmosphere), 0) AS atmosphere
FROM wongnok_post_review wpr WITH (NOLOCK) 
LEFT JOIN wongnok_review_score wrs WITH (NOLOCK) ON wrs.post_review_id = wpr.post_review_id
WHERE wpr.shop_id = @shop_id
AND wpr.active = 1