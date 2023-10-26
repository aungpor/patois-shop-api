INSERT INTO dbo.wongnok_opendatetimes
(opendatetime_id, shopweekday_id, shopweekday_name, open_time, close_time, created_at, updated_at, created_by, updated_by)
VALUES(@opendatetime_id, @shopweekday_id, @shopweekday_name, @open_time, @close_time, getdate(), getdate(), @created_by, @updated_by);

SELECT SCOPE_IDENTITY() AS openDateTimesId