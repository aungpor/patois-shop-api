INSERT INTO patois_notifications (user_id,title,description,types,withs,status,created_at,updated_at,ref_id)
VALUES(@user_id,@vTitle,@vDescription,@vTypes,@withs,1,GETDATE(),GETDATE(),@ref_id)

SELECT SCOPE_IDENTITY() AS notificationsId
