export interface UserAccount {
  id: string
  user_id: string
  full_name?: string
  address?: string
  institution?: string
  affiliation?: string
  profile_image_url?: string
  bio?: string
  website_url?: string
  google_scholar_url?: string
  linkedin_url?: string
  github_url?: string
  facebook_url?: string
  orcid_id?: string
  country?: string
  timezone?: string
  preferred_language?: string
  created_at: string
  updated_at: string
}

export interface UserAccountForm {
  full_name: string
  address: string
  institution: string
  affiliation: string
  bio: string
  website_url: string
  google_scholar_url: string
  linkedin_url: string
  github_url: string
  facebook_url: string
  orcid_id: string
  country: string
  timezone: string
  preferred_language: string
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
  color: string
}

export interface AccountSection {
  id: string
  title: string
  description: string
  icon: string
  fields: AccountField[]
}

export interface AccountField {
  name: keyof UserAccountForm
  label: string
  type: 'text' | 'textarea' | 'url' | 'select'
  placeholder: string
  required?: boolean
  options?: { value: string; label: string }[]
} 