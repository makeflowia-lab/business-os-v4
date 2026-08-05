export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface AllowedEmail {
  id: string
  email: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      allowed_emails: {
        Row: AllowedEmail
        Insert: Omit<AllowedEmail, 'id' | 'created_at'>
        Update: Partial<Omit<AllowedEmail, 'id' | 'created_at'>>
      }
    }
  }
}
