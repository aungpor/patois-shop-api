select u.name,l.* from dbo.users u WITH (NOLOCK) 
left join dbo.wongnok_line l WITH (NOLOCK) on u.line_id = l.userline_id
where u.id = @user_id