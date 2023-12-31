SELECT [id]
      ,[name]
      ,[email]
      ,[email_verified_at]
      ,[created_at]
      ,[updated_at]
      ,[teamName]
      ,[emp_id]
      ,[line_id]
      ,[profile_pic_line]
      ,[tel]
      ,[active]
      ,[pdpa_id]
      ,[pdpa_isagree]
  FROM [dbo].[users] WITH (NOLOCK) 
  where [id] = @userId