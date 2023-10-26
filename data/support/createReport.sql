INSERT INTO [dbo].[patois_report_transaction]
([source_id], [category_id], [reference_id], [reporter_user_id], [verification_status_code], [remark ], 
[create_date], [update_date], [create_by], [update_by])
VALUES(@source_id, @category_id, @reference_id, @reporter_user_id, @verification_status_code, @remark, 
getdate(), getdate(), @user_id, @user_id)

SELECT SCOPE_IDENTITY() AS patois_report_transaction_id 