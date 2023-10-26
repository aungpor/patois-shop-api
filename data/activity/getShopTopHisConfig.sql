select * from dbo.patois_shop_top_hit_config WITH (NOLOCK)  where group_code = @group_code
order by order_no
