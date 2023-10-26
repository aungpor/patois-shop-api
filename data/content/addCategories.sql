INSERT INTO patois_content_category (
    content_section_id,
    category_name,
    category_desc,
    active,
    create_date,
    create_by,
    update_date,
    update_by,
    order_no
)
VALUES (
    @content_section_id,
    @category_name,
    @category_desc,
    @active,
    getDate(),
    @create_by,
    getDate(),
    @update_by,
    @order_no
);

SELECT SCOPE_IDENTITY() AS contentCategoryId