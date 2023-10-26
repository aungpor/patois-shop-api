SELECT *
FROM [dbo].[patois_ms_shop_eating_type] WITH (NOLOCK) 
where shop_eating_type_active = 1
order by shop_eating_type_code 