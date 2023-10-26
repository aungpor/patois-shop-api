SELECT opendatetimes_id, opendatetime_id, shopweekday_id, shopweekday_name, open_time, close_time, created_at, updated_at, created_by, updated_by
FROM dbo.wongnok_opendatetimes WITH (NOLOCK) 
WHERE opendatetime_id = @opendatetime_id
