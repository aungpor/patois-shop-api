select 
f.follower_user_id,
f.following_user_id
 from [dbo].[patois_user_follow] f WITH (NOLOCK) 
where f.following_user_id = @userId