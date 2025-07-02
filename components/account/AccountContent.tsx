"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  User, 
  GraduationCap, 
  Settings, 
  Camera, 
  Save, 
  Edit3, 
  ExternalLink,
  MapPin,
  Building,
  Globe,
  Mail,
  Calendar,
  Briefcase,
  Github,
  Facebook,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Languages,
  Clock
} from "lucide-react"
import { accountApi } from "@/lib/api/account"
import { getUserData } from "@/lib/api/auth"
import { UserAccount, UserAccountForm } from "@/types/account"
import { ACCOUNT_SECTIONS, SOCIAL_LINKS, PROFILE_IMAGE_CONSTRAINTS } from "@/constants/account"
import { cn } from "@/lib/utils/cn"

export function AccountContent() {
  const [accountData, setAccountData] = useState<UserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [activeSection, setActiveSection] = useState("personal")

  const userData = getUserData()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<UserAccountForm>()

  // Load account data and initialize form
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        const account = await accountApi.getAccount()
        setAccountData(account)
        
        if (account) {
          // Create form data from account data, preserving existing values
          const formData: Partial<UserAccountForm> = {
            full_name: account.full_name || "",
            address: account.address || "",
            institution: account.institution || "",
            affiliation: account.affiliation || "",
            bio: account.bio || "",
            website_url: account.website_url || "",
            google_scholar_url: account.google_scholar_url || "",
            linkedin_url: account.linkedin_url || "",
            github_url: account.github_url || "",
            facebook_url: account.facebook_url || "",
            orcid_id: account.orcid_id || "",
            country: account.country || "",
            timezone: account.timezone || "",
            preferred_language: account.preferred_language || ""
          }
          
          // Reset form with existing data
          reset(formData)
        } else {
          // If no account data, initialize with empty values
          reset({
            full_name: "",
            address: "",
            institution: "",
            affiliation: "",
            bio: "",
            website_url: "",
            google_scholar_url: "",
            linkedin_url: "",
            github_url: "",
            facebook_url: "",
            orcid_id: "",
            country: "",
            timezone: "",
            preferred_language: ""
          })
        }
      } catch (error) {
        console.error("Failed to load account data:", error)
        toast.error("Failed to load account information")
      } finally {
        setIsLoading(false)
      }
    }

    loadAccountData()
  }, [reset])

  // Handle form submission
  const onSubmit = async (data: UserAccountForm) => {
    if (!isDirty) {
      setIsEditMode(false)
      return
    }

    setIsUpdating(true)
    try {
      // Only send changed fields that have values
      const updateData: Partial<UserAccountForm> = {}
      
      // Get current form values and existing account data
      Object.keys(data).forEach((key) => {
        const fieldKey = key as keyof UserAccountForm
        const newValue = data[fieldKey]?.trim()
        const existingValue = accountData?.[fieldKey] || ""
        
        // Include field if it has a value or if it's different from existing
        if (newValue !== undefined && (newValue !== "" || existingValue !== "")) {
          updateData[fieldKey] = newValue
        }
      })

      const result = await accountApi.updateAccount(updateData)
      
      if (result.success) {
        setAccountData(result.data || null)
        
        // Update form with new data to reflect any server-side changes
        if (result.data) {
          const formData: Partial<UserAccountForm> = {
            full_name: result.data.full_name || "",
            address: result.data.address || "",
            institution: result.data.institution || "",
            affiliation: result.data.affiliation || "",
            bio: result.data.bio || "",
            website_url: result.data.website_url || "",
            google_scholar_url: result.data.google_scholar_url || "",
            linkedin_url: result.data.linkedin_url || "",
            github_url: result.data.github_url || "",
            facebook_url: result.data.facebook_url || "",
            orcid_id: result.data.orcid_id || "",
            country: result.data.country || "",
            timezone: result.data.timezone || "",
            preferred_language: result.data.preferred_language || ""
          }
          reset(formData)
        }
        
        setIsEditMode(false)
        toast.success("Account updated successfully!")
      } else {
        toast.error(result.message || "Failed to update account")
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Failed to update account")
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle cancel editing
  const handleCancelEdit = () => {
    if (accountData) {
      // Reset form to original values
      const formData: Partial<UserAccountForm> = {
        full_name: accountData.full_name || "",
        address: accountData.address || "",
        institution: accountData.institution || "",
        affiliation: accountData.affiliation || "",
        bio: accountData.bio || "",
        website_url: accountData.website_url || "",
        google_scholar_url: accountData.google_scholar_url || "",
        linkedin_url: accountData.linkedin_url || "",
        github_url: accountData.github_url || "",
        facebook_url: accountData.facebook_url || "",
        orcid_id: accountData.orcid_id || "",
        country: accountData.country || "",
        timezone: accountData.timezone || "",
        preferred_language: accountData.preferred_language || ""
      }
      reset(formData)
    }
    setIsEditMode(false)
  }

  // Handle profile image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!PROFILE_IMAGE_CONSTRAINTS.allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)")
      return
    }

    if (file.size > PROFILE_IMAGE_CONSTRAINTS.maxSize) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setIsUploadingImage(true)
    try {
      const result = await accountApi.uploadProfileImage(file)
      
      if (result.success) {
        setAccountData(prev => prev ? { ...prev, profile_image_url: result.url } : null)
        toast.success("Profile image updated successfully!")
      } else {
        toast.error(result.message || "Failed to upload image")
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle profile image deletion
  const handleImageDelete = async () => {
    setIsUploadingImage(true)
    try {
      const result = await accountApi.deleteProfileImage()
      
      if (result.success) {
        setAccountData(prev => prev ? { ...prev, profile_image_url: undefined } : null)
        toast.success("Profile image removed successfully!")
      } else {
        toast.error(result.message || "Failed to remove image")
      }
    } catch (error) {
      console.error("Image delete error:", error)
      toast.error("Failed to remove image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Get icon component
  const getIcon = (iconName: string) => {
    const icons = {
      User,
      GraduationCap,
      Settings,
      Briefcase,
      Github,
      Facebook,
      Globe
    }
    return icons[iconName as keyof typeof icons] || User
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-primary/10 bg-background/40 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                Account Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditMode ? "Edit your profile and account preferences" : "View and manage your profile information"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {!isEditMode ? (
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area with Separate Scrolling */}
      <div className="relative z-10 flex h-[calc(100vh-140px)]">
        {/* Left Sidebar - Fixed Scrolling */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-80 bg-background/20 backdrop-blur-xl border-r border-primary/10 overflow-y-auto"
        >
          <div className="p-6 space-y-4">
            {/* Profile Overview Card */}
            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Profile Image */}
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={accountData?.profile_image_url} 
                        alt={accountData?.full_name || userData?.email || "Profile"} 
                      />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                        {accountData?.full_name 
                          ? accountData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                          : userData?.email?.[0].toUpperCase() || 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditMode && (
                      <div className="absolute -bottom-2 -right-2 flex gap-1">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full hover:bg-primary/90 transition-colors">
                            {isUploadingImage ? (
                              <Loader2 className="h-4 w-4 text-white animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </label>
                        
                        {accountData?.profile_image_url && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-8 h-8 p-0"
                            onClick={handleImageDelete}
                            disabled={isUploadingImage}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <h3 className="font-semibold text-lg mb-1">
                    {accountData?.full_name || "Add your name"}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {userData?.email}
                  </p>
                  
                  {accountData?.institution && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Building className="h-3 w-3" />
                      {accountData.institution}
                    </div>
                  )}
                  
                  {accountData?.country && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      {accountData.country}
                    </div>
                  )}

                  {/* Bio */}
                  {accountData?.bio && (
                    <p className="text-sm text-muted-foreground text-center">
                      {accountData.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Social & Professional Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SOCIAL_LINKS.map((social) => {
                  const url = accountData?.[social.url as keyof UserAccount] as string
                  const Icon = getIcon(social.icon)
                  
                  return (
                    <div key={social.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", social.color)} />
                        <span className="text-sm">{social.platform}</span>
                      </div>
                      {url ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not set</span>
                      )}
                    </div>
                  )
                })}
                
                {accountData?.website_url && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Website</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => window.open(accountData.website_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Right Content Area - Separate Scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {!isEditMode ? (
                /* Profile View Mode */
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Personal Information */}
                  <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="mt-1">{accountData?.full_name || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <p className="mt-1">{accountData?.country || "Not provided"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="mt-1">{accountData?.address || "Not provided"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Bio</label>
                        <p className="mt-1">{accountData?.bio || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Academic & Professional */}
                  <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Academic & Professional
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Institution</label>
                        <p className="mt-1">{accountData?.institution || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Affiliation</label>
                        <p className="mt-1">{accountData?.affiliation || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">ORCID iD</label>
                        <p className="mt-1">{accountData?.orcid_id || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Website</label>
                        {accountData?.website_url ? (
                          <div className="mt-1 flex items-center gap-2">
                            <a 
                              href={accountData.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {accountData.website_url}
                            </a>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                        ) : (
                          <p className="mt-1">Not provided</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preferences */}
                  <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Languages className="h-3 w-3" />
                          Preferred Language
                        </label>
                        <p className="mt-1">{accountData?.preferred_language || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Timezone
                        </label>
                        <p className="mt-1">{accountData?.timezone || "Not set"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                /* Edit Mode */
                <motion.div
                  key="edit-mode"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Section Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {ACCOUNT_SECTIONS.map((section) => {
                      const Icon = getIcon(section.icon)
                      return (
                        <Button
                          key={section.id}
                          variant={activeSection === section.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveSection(section.id)}
                          className={cn(
                            "flex items-center gap-2",
                            activeSection === section.id
                              ? "bg-gradient-to-r from-primary to-blue-600 text-white"
                              : "border-primary/20 hover:bg-primary/5"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {section.title}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Edit Form Content */}
                  <AnimatePresence mode="wait">
                    {ACCOUNT_SECTIONS.map((section) => {
                      if (activeSection !== section.id) return null
                      
                      const Icon = getIcon(section.icon)
                      
                      return (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-primary" />
                                {section.title}
                              </CardTitle>
                              <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.fields.map((field) => (
                                  <div
                                    key={field.name}
                                    className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                                  >
                                    <label className="block text-sm font-medium mb-2">
                                      {field.label}
                                      {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    
                                    {field.type === 'textarea' ? (
                                      <Textarea
                                        {...register(field.name, { required: field.required })}
                                        placeholder={field.placeholder}
                                        className="min-h-[100px]"
                                      />
                                    ) : field.type === 'select' ? (
                                      <Select
                                        value={watch(field.name) || ""}
                                        onValueChange={(value) => setValue(field.name, value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder={field.placeholder} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {field.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Input
                                        {...register(field.name, { required: field.required })}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                      />
                                    )}
                                    
                                    {errors[field.name] && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {field.label} is required
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Social Links for academic section */}
                              {section.id === 'academic' && (
                                <div className="border-t pt-6">
                                  <h4 className="font-medium mb-4 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    Social & Professional Links
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {SOCIAL_LINKS.map((social) => (
                                      <div key={social.platform}>
                                        <label className="block text-sm font-medium mb-2">
                                          {social.platform}
                                        </label>
                                        <Input
                                          {...register(social.url as keyof UserAccountForm)}
                                          type="url"
                                          placeholder={`Your ${social.platform} profile URL`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
} 