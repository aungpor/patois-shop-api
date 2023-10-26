INSERT INTO dbo.patois_error_log
(user_id, error_from, error_name, error_func_name, error_code, error_massage, created_at)
VALUES(@user_id, @error_from, @error_name, @error_func_name, @error_code, @error_massage, getdate())

SELECT SCOPE_IDENTITY() AS errorLogId
