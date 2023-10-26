SELECT cs.section_name,cs.content_section_id,c.category_name,c.content_category_id,s.sub_category_name, ct.*
,images.[fileName] as [image_list],
images.[description] as [image_url]
--,(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = ct.images_id) as image_list_thumbnail,
--(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = ct.images_id) as image_url_thumbnail
,images_desktop.[fileName] as [image_desktop_list],
images_desktop.[description] as [image_desktop_url]
--,(SELECT STRING_AGG(th.fileName,',') as images_thumbnail_fileName FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = ct.images_id_desktop) as image__desktoplist_thumbnail,
--(SELECT STRING_AGG(th.description,',') as images_thumbnail_description FROM patois_images_thumbnail th WITH (NOLOCK)   where th.patois_images_id = ct.images_id_desktop) as image_desktop_url_thumbnail
, (select STRING_AGG(ptg.tag_name,'|') as tag_name from patois_tag ptg where ptg.tag_id in( select bt.tag_id from dbo.patois_bind_tag bt where ct.content_id = bt.ref_id and bt.ref_type = 'CONTENT')) as tag_name  
, (select STRING_AGG(ptg.tag_id,'|') as tag_id from patois_tag ptg where ptg.tag_id in( select bt.tag_id from dbo.patois_bind_tag bt where ct.content_id = bt.ref_id and bt.ref_type = 'CONTENT')) as tag_id   
, u.name,u.profile_pic_line,u.profile_pic_patois
FROM [dbo].[patois_content] ct WITH (NOLOCK) 
LEFT JOIN dbo.patois_content_sub_category s WITH (NOLOCK)  on s.content_sub_category_id = ct.content_sub_category_id
LEFT JOIN dbo.patois_content_category c WITH (NOLOCK)  on s.content_category_id = c.content_category_id
LEFT JOIN dbo.patois_content_section cs WITH (NOLOCK)  on c.content_section_id = cs.content_section_id
LEFT JOIN dbo.users u on u.id = ct.create_by
LEFT JOIN [dbo].[patois_images] images WITH (NOLOCK) on ct.images_id = images.images_id
LEFT JOIN [dbo].[patois_images] images_desktop WITH (NOLOCK) on ct.images_id_desktop = images_desktop.images_id
where ct.content_id = @content_id