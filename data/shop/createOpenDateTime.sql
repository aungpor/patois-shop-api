INSERT INTO dbo.wongnok_opendatetime
(created_at, updated_at, created_by, updated_by, active)
VALUES(getdate(), getdate(), @created_by, @updated_by, 1);

SELECT SCOPE_IDENTITY() AS openDateTimeId