INSERT INTO [dbo].[patois_images_thumbnail] (
       [fileName]
      ,[fileExtensions]
      ,[description]
      ,[tag_id]
      ,[patois_images_id]
      ,[img_alt]
)
VALUES (
    @fileName,
    @fileExtensions,
    @description,
    @tag_id,
    @patois_images_id,
    @img_alt
)

SELECT SCOPE_IDENTITY() AS thumbnailId