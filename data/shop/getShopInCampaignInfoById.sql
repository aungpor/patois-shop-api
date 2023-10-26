select top 1  cu.*
,(select in_campaign_type from wongnok_shop where shop_id = @shop_id) as in_campaign_type
from patois_campaign_user cu WITH (NOLOCK) 
where cu.ref_code in(
    select u.user_code from wongnok_shop s WITH (NOLOCK) 
    left join users u WITH (NOLOCK) on u.id = s.user_id
    where s.shop_id = @shop_id
)
and cu.active = 1
order by campaign_user_id desc
