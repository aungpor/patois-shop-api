SELECT COUNT(*) AS count FROM patois_shop_list_menu WITH (NOLOCK) 
WHERE shop_id = @shop_id
AND menu = @menu
AND type = @type