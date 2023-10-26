SELECT ct.content_id,
ct.content_name,
c.content_category_id,
c.category_name,
s.content_sub_category_id,
s.sub_category_name, 
images.[images_id] as [images_id],
images.[fileName] as [image_list],
images.[description] as [image_url],
images.[img_alt] as [image_alt],
images_desktop.[images_id] as [image_desktop_id],
images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url],
images_desktop.[img_alt] as [image_desktop_alt],
ct.short_desc,
ct.short_quote,
ct.content_detail,
convert(varchar, ct.start_date, 23) as start_date,
convert(varchar, ct.end_date, 23) as end_date,
ct.status,
u.name,
ct.sponsored,
ct.review_url
FROM [dbo].[patois_content] ct WITH (NOLOCK) 
LEFT JOIN dbo.patois_content_sub_category s WITH (NOLOCK)  on s.content_sub_category_id = ct.content_sub_category_id
LEFT JOIN dbo.patois_content_category c WITH (NOLOCK)  on s.content_category_id = c.content_category_id
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ct.images_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ct.images_id_desktop = images_desktop.images_id
LEFT JOIN dbo.users u on u.id = ct.create_by
where ct.content_id = @content_id