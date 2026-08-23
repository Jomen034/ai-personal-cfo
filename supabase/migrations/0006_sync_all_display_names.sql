-- Onboarding previously allowed manual display names. Normalize all existing
-- memberships to the same email-derived value used by new memberships.
update public.household_members as members
set display_name = split_part(users.email, '@', 1)
from auth.users as users
where members.auth_user_id = users.id
  and users.email is not null;