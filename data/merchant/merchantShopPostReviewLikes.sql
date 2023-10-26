select 
post_review_like_id ,
user_id,
cast(case when post_review_like_id is null then 0 else 1 end as bit) as post_review_love
from wongnok_post_review_like  WITH (NOLOCK) 
where post_review_id = @post_review_id