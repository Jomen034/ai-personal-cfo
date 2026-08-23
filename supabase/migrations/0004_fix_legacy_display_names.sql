-- Legacy onboarding stored the household name as the admin display name.
-- Keep the household name intact and use the account email as a neutral fallback.
update household_members as members
set display_name = split_part(users.email, '@', 1)
from auth.users as users, households
where members.auth_user_id = users.id
  and households.id = members.household_id
  and members.role = 'admin'
  and members.display_name = households.name;