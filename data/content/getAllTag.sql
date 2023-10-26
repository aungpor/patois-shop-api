
SELECT * FROM dbo.patois_tag WITH (NOLOCK) 
where active = @active
order by tag_name

-- OFFSET (@PageNumber-1)*@RowsOfPage ROWS
-- FETCH NEXT @RowsOfPage ROWS ONLY	