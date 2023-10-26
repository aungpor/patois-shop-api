select top 1 a.id, a.name, e.foodType_id as lastview_id, e.foodTypeName as lastview_name,  i.foodType_id as lastreview_id , i.foodTypeName as lastreview_name from [dbo].[users] a WITH (NOLOCK) 
left join (select user_id,  MAX(created_at) 'lastview' from  [dbo].[patois_visit] WITH (NOLOCK)  where actions = 'View' group by user_id) as b  on a.id = b.user_id​
left join  [dbo].[patois_visit] as c WITH (NOLOCK) on b.lastview = c.created_at​
left join  [dbo].[wongnok_shop] as d WITH (NOLOCK) on d.shop_id = c.sid​
left join  [dbo].[wongnok_food] as e WITH (NOLOCK) on d.foodType_id = e.foodType_id​
left join (select user_id,  MAX(created_at) 'lastreview' from [dbo].[wongnok_post_review] WITH (NOLOCK)  group by user_id) as f  on a.id = f.user_id​
left join [dbo].[wongnok_post_review] as g WITH (NOLOCK) on g.created_at = f.lastreview​
left join [dbo].[wongnok_shop] as h WITH (NOLOCK) on h.shop_id = g.shop_id​
left join [dbo].[wongnok_food] as i WITH (NOLOCK) on h.foodType_id = i.foodType_id​
where a.name != 'System'​
and a.id = @userId