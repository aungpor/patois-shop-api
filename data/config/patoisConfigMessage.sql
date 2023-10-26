SELECT *
FROM  dbo.patois_config_message WITH (NOLOCK) 
where message_type = @message_type and message_code = @message_code