INSERT INTO patois_content (content_sub_category_id,
    content_name,
    content_detail,
    images_id,
    short_desc,
    short_quote,
    show_writer_name,
    start_date,
    end_date,
    active,
    create_date,
    create_by,
    update_date,
    update_by,
    order_no,
    approve,
    images_id_desktop,
    sponsored,
    review_url,
    status,
    review_shop_id
)
VALUES (@content_sub_category_id,
    @content_name,
    @content_detail, 
    @images_id,
    @short_desc,
    @short_quote,
    @show_writer_name,
    CONVERT(DATE,dateadd(HOUR, 7, @start_date),101),
    CONVERT(DATE,dateadd(HOUR, 7, @end_date),101),
    @active,
    getDate(),
    @create_by,
    getDate(),
    @update_by,
    @order_no,
    @approve,
    @images_id_desktop,
    @sponsored,
    @review_url,
    @status,
    @review_shop_id
);

SELECT SCOPE_IDENTITY() AS contentId