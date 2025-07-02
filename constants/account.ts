import { AccountSection, SocialLink } from "@/types/account"
import { User, MapPin, Building, GraduationCap, Globe, Settings, Palette } from "lucide-react"

export const ACCOUNT_SECTIONS: AccountSection[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Basic personal details and contact information",
    icon: "User",
    fields: [
      {
        name: "full_name",
        label: "Full Name",
        type: "text",
        placeholder: "Enter your full name",
        required: true
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        placeholder: "Enter your address"
      },
      {
        name: "country",
        label: "Country",
        type: "select",
        placeholder: "Select your country",
        options: [
          { value: "US", label: "United States" },
          { value: "UK", label: "United Kingdom" },
          { value: "CA", label: "Canada" },
          { value: "AU", label: "Australia" },
          { value: "DE", label: "Germany" },
          { value: "FR", label: "France" },
          { value: "JP", label: "Japan" },
          { value: "CN", label: "China" },
          { value: "IN", label: "India" },
          { value: "BR", label: "Brazil" },
          // Add more countries as needed
        ]
      },
      {
        name: "bio",
        label: "Bio",
        type: "textarea",
        placeholder: "Tell us about yourself, your research interests, and academic background"
      }
    ]
  },
  {
    id: "academic",
    title: "Academic & Professional",
    description: "Institution, affiliation, and professional details",
    icon: "GraduationCap",
    fields: [
      {
        name: "institution",
        label: "Institution",
        type: "text",
        placeholder: "Your university, company, or organization"
      },
      {
        name: "affiliation",
        label: "Affiliation",
        type: "text",
        placeholder: "Department, school, or division"
      },
      {
        name: "orcid_id",
        label: "ORCID iD",
        type: "text",
        placeholder: "0000-0000-0000-0000"
      },
      {
        name: "website_url",
        label: "Personal Website",
        type: "url",
        placeholder: "https://yourwebsite.com"
      }
    ]
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Language, timezone, and display preferences",
    icon: "Settings",
    fields: [
      {
        name: "preferred_language",
        label: "Preferred Language",
        type: "select",
        placeholder: "Select language",
        options: [
          { value: "en", label: "English" },
          { value: "es", label: "Spanish" },
          { value: "fr", label: "French" },
          { value: "de", label: "German" },
          { value: "zh", label: "Chinese" },
          { value: "ja", label: "Japanese" },
          { value: "ko", label: "Korean" },
          { value: "pt", label: "Portuguese" },
          { value: "it", label: "Italian" },
          { value: "ru", label: "Russian" }
        ]
      },
      {
        name: "timezone",
        label: "Timezone",
        type: "select",
        placeholder: "Select timezone",
        options: [
          { value: "UTC", label: "UTC" },
          { value: "America/New_York", label: "Eastern Time (UTC-5)" },
          { value: "America/Chicago", label: "Central Time (UTC-6)" },
          { value: "America/Denver", label: "Mountain Time (UTC-7)" },
          { value: "America/Los_Angeles", label: "Pacific Time (UTC-8)" },
          { value: "Europe/London", label: "London (UTC+0)" },
          { value: "Europe/Paris", label: "Paris (UTC+1)" },
          { value: "Europe/Berlin", label: "Berlin (UTC+1)" },
          { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
          { value: "Asia/Shanghai", label: "Shanghai (UTC+8)" },
          { value: "Asia/Kolkata", label: "India (UTC+5:30)" },
          { value: "Australia/Sydney", label: "Sydney (UTC+11)" }
        ]
      }
    ]
  }
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "Google Scholar",
    url: "google_scholar_url",
    icon: "GraduationCap",
    color: "text-blue-500"
  },
  {
    platform: "LinkedIn",
    url: "linkedin_url", 
    icon: "Briefcase",
    color: "text-blue-600"
  },
  {
    platform: "GitHub",
    url: "github_url",
    icon: "Github", 
    color: "text-gray-700 dark:text-gray-300"
  },
  {
    platform: "Facebook",
    url: "facebook_url",
    icon: "Facebook",
    color: "text-blue-700"
  }
]

export const PROFILE_IMAGE_CONSTRAINTS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  dimensions: {
    min: { width: 100, height: 100 },
    max: { width: 2000, height: 2000 }
  }
} 