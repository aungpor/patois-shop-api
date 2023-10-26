SELECT COUNT(*) as total
FROM wongnok_post_review 
WHERE DATEADD(HOUR, 7, GETDATE()) <= DATEADD(DAY, (@day), DATEADD(HOUR, 7, created_at))
AND shop_id = @shop_id
AND active = 1

;WITH CTE_CALENDAR AS 
(SELECT CONVERT(DATE,  DATEADD(HOUR, 7, GETDATE())) AS [DATE] UNION ALL
SELECT DATEADD(DAY, -1, [DATE])
FROM CTE_CALENDAR
WHERE [DATE] >= DATEADD(DAY, -(@day-1), GETDATE())
)

SELECT FORMAT ([DATE], 'dd MMM', 'th-TH') AS dateReview, count(wpr.shop_id) as countReview
FROM CTE_CALENDAR 
LEFT JOIN wongnok_post_review wpr ON [DATE] = CONVERT(DATE,  DATEADD(HOUR, 7, wpr.created_at)) AND wpr.shop_id = @shop_id AND wpr.active = 1
GROUP BY [DATE]
ORDER BY [DATE] ASC