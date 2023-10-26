SELECT COUNT(*) AS countReviewAll, ISNULL(ROUND(AVG(CAST(wrs.total AS DECIMAL(7,1))),1),0) scoreTotal
FROM wongnok_post_review wpr
LEFT JOIN wongnok_review_score wrs ON wrs.post_review_id = wpr.post_review_id
WHERE wpr.shop_id = @shop_id
AND wpr.active = 1

;WITH CTE_SCORE AS 
(SELECT 5 AS [SCORE] UNION ALL
SELECT [SCORE] - 1
FROM CTE_SCORE
WHERE [SCORE] > 1
)

SELECT [SCORE] AS score, count(wrs.total) AS countReview
FROM CTE_SCORE
LEFT JOIN wongnok_post_review wpr ON wpr.shop_id = @shop_id AND wpr.active = 1 
LEFT JOIN wongnok_review_score wrs ON wrs.post_review_id = wpr.post_review_id AND FLOOR(wrs.total) = [SCORE]
GROUP BY [SCORE]
ORDER BY [SCORE] DESC
