INSERT INTO [dbo].[patois_images_thumbnail] (
       [fileName]
      ,[fileExtensions]
      ,[description]
      ,[tag_id]
      ,[patois_images_id]
)
VALUES (
    @fileName,
    @fileExtensions,
    @description,
    @tag_id,
    @patois_images_id
)

SELECT SCOPE_IDENTITY() AS thumbnailId