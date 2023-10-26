SELECT images.fileName as image_list,
images.description as image_url,
images.img_alt as image_alt,
images_desktop.fileName as image_desktop_list,
images_desktop.description as image_desktop_url,
images_desktop.img_alt as image_desktop_alt,
pc.content_name,
pcsc.sub_category_name,
pcsc.sub_category_desc,
FORMAT(dateadd(HOUR, 7, pc.create_date),'dd/MM/yyyy hh:mm:ss tt') as create_date,
FORMAT(dateadd(HOUR, 7, pc.update_date),'dd/MM/yyyy hh:mm:ss tt') as update_date,
FORMAT(pc.start_date,'dd/MM/yyyy hh:mm:ss tt') as start_date,
FORMAT(pc.end_date,'dd/MM/yyyy hh:mm:ss tt') as end_date,
pc.content_id
FROM patois_content pc WITH (NOLOCK)
LEFT JOIN patois_content_sub_category pcsc WITH (NOLOCK) on pcsc.content_sub_category_id = pc.content_sub_category_id
LEFT JOIN patois_images images WITH (NOLOCK) on images.images_id = pc.images_id
LEFT JOIN patois_images images_desktop WITH (NOLOCK) on images_desktop.images_id = pc.images_id_desktop
ORDER BY pc.create_date DESC

OFFSET (@PageNumber-1)*@RowsOfPage ROWS
FETCH NEXT @RowsOfPage ROWS ONLY	