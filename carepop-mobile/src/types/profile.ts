export type Profile = {
  id: string;
  updated_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  pronouns: string | null;
  onboarding_completed: boolean;
}; 