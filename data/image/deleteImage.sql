delete [dbo].[patois_images]
where images_id = @imagesId


delete [dbo].[patois_image_hash]
where image_id = @imagesId


delete [dbo].[patois_images_thumbnail]
where patois_images_id = @imagesId