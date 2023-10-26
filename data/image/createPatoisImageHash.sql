INSERT INTO [dbo].[patois_image_hash] (
       [image_hash_val]
      ,[status]
      ,[image_id]
      ,[error_massage]
      ,[fileName]
      ,[active]
      ,[verification_status_code]
      ,[create_by]
      ,[update_by]
      ,[create_date]
      ,[update_date]
)
VALUES (
    @imageHashVal,
    @status,
    @imageId,
    @error_massage,
    @fileName,
    @active,
    @verification_status_code,
    @userId,
    @userId,
    getdate(),
    getdate()
)

SELECT SCOPE_IDENTITY() AS imageHashId