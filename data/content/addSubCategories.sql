INSERT INTO [dbo].[patois_content_sub_category](
    [content_category_id],
    [sub_category_name], 
    [sub_category_desc],
    [active], 
    [create_date], 
    [create_by], 
    [update_date], 
    [update_by], 
    [order_no]
) 
	VALUES(
    @content_category_id, 
    @sub_category_name, 
    @sub_category_desc,
    @active,
    getDate(),
    @create_by,
    getDate(),
    @update_by,
    @order_no
);

SELECT SCOPE_IDENTITY() AS contentSubCategoryId
