import { getApiUrl } from "@/lib/config/api-config"
import { authenticatedFetch } from "./auth"
import { UserAccount, UserAccountForm } from "@/types/account"

export const accountApi = {
  // Get user account information
  getAccount: async (): Promise<UserAccount | null> => {
    try {
      const response = await authenticatedFetch(getApiUrl("/api/v1/account"))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch account: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("Get account error:", error)
      return null
    }
  },

  // Update user account information
  updateAccount: async (accountData: Partial<UserAccountForm>): Promise<{success: boolean, data?: UserAccount, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl("/api/v1/account"), {
        method: "PUT",
        body: JSON.stringify(accountData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update account")
      }
      
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error("Update account error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update account"
      }
    }
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<{success: boolean, url?: string, message?: string}> => {
    try {
      const formData = new FormData()
      formData.append("profile_image", file)
      
      const response = await authenticatedFetch(getApiUrl("/api/v1/account/profile-image"), {
        method: "POST",
        body: formData,
        headers: {} // Don't set Content-Type for FormData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload profile image")
      }
      
      return {
        success: true,
        url: data.data.profile_image_url,
        message: data.message
      }
    } catch (error) {
      console.error("Upload profile image error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload profile image"
      }
    }
  },

  // Delete profile image
  deleteProfileImage: async (): Promise<{success: boolean, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl("/api/v1/account/profile-image"), {
        method: "DELETE"
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete profile image")
      }
      
      return {
        success: true,
        message: data.message
      }
    } catch (error) {
      console.error("Delete profile image error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete profile image"
      }
    }
  }
} 