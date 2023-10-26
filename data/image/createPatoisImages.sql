INSERT INTO [dbo].[patois_images] (
       [fileName]
      ,[fileExtensions]
      ,[description]
      ,[tag_id]
      ,[img_alt]
)
VALUES (
    @fileName,
    @fileExtensions,
    @description,
    @tag_id,
    @img_alt
)

SELECT SCOPE_IDENTITY() AS imagesId