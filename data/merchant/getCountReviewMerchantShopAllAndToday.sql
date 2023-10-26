SELECT
(SELECT count(*) as countAll 
FROM wongnok_post_review
WHERE shop_id = @shop_id
AND active != 0
) as countAll,
(SELECT count(*) as countToday
FROM wongnok_post_review
WHERE shop_id = @shop_id
AND active != 0
AND CONVERT(DATE,dateadd(HOUR, 7, getdate()),101) = CONVERT(DATE,dateadd(HOUR, 7, created_at),101)
) as countToday