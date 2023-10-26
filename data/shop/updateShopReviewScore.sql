UPDATE dbo.wongnok_review_score
SET cleanliness=@cleanliness, 
delicious=@delicious, 
pricing=@pricing, 
total=@total, 
service=@service, 
atmosphere=@atmosphere, 
updated_at=getdate()
WHERE review_score_id=@review_score_id

SELECT * FROM dbo.wongnok_review_score WITH (NOLOCK) 
WHERE review_score_id=@review_score_id