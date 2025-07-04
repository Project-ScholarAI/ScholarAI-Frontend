"use client"

import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { InputField } from "@/components/form/InputField"
import { PasswordField } from "@/components/form/PasswordField"
import { Checkbox } from "@/components/form/Checkbox"
import { AUTH_CONSTANTS } from "@/constants/auth"
import { login, type SocialLoginResponse } from "@/lib/api/auth"
import type { LoginFormData } from "@/types/auth"
import SocialLogin from "./SocialLogin"
import { useAuth } from "@/hooks/useAuth"
import { useNavigationWithLoading } from "@/components/ui/RouteTransition"

const MouseGlitter = () => {
    const [particles, setParticles] = useState<Array<{ x: number; y: number; id: string }>>([])
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = useCallback((e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY })

        // Add new particle with timestamp-based unique ID
        setParticles(prev => {
            const newParticles = [...prev, {
                x: e.clientX,
                y: e.clientY,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }]
            return newParticles.slice(-20) // Keep only last 20 particles
        })
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [handleMouseMove])

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        transform: 'translate(-50%, -50%)',
                        animation: 'fadeOut 1s forwards',
                        boxShadow: '0 0 12px rgba(99, 102, 241, 0.8), 0 0 24px rgba(139, 92, 246, 0.4)',
                    }}
                />
            ))}
        </div>
    )
}

export function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        rememberMe: false,
    })

    const [errors, setErrors] = useState({ email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [sessionExpired, setSessionExpired] = useState(false)
    const [signupSuccess, setSignupSuccess] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [socialLoginSuccessMessage, setSocialLoginSuccessMessage] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { updateAuthState } = useAuth()
    const { navigateWithLoading } = useNavigationWithLoading()

    /* ────────────────────────────────────────────────────────── */
    /*  Handlers                                                 */
    /* ────────────────────────────────────────────────────────── */
    useEffect(() => {
        if (searchParams.get("session") === "expired") setSessionExpired(true)
        if (searchParams.get("signup") === "success") {
            setSignupSuccess(true)
            setTimeout(() => setSignupSuccess(false), 5000)
        }
        if (searchParams.get("reset") === "success") {
            setResetSuccess(true)
            setTimeout(() => setResetSuccess(false), 5000)
        }
    }, [searchParams])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
        if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: "" }))
        if (sessionExpired) setSessionExpired(false)
        if (signupSuccess) setSignupSuccess(false)
        if (resetSuccess) setResetSuccess(false)
        if (socialLoginSuccessMessage) setSocialLoginSuccessMessage(null)
    }

    const toggleShowPassword = () => setShowPassword((prev) => !prev)

    const validateForm = (): boolean => {
        let valid = true
        const newErrors = { ...errors }

        if (!formData.email) {
            newErrors.email = "Email is required"
            valid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email"
            valid = false
        }

        if (!formData.password) {
            newErrors.password = "Password is required"
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        console.log('Form submission started')
        console.log('Submitting with email:', formData.email)
        console.log('Submitting with password length:', formData.password.length)

        try {
            const response = await login(formData)
            console.log('Login response received:', response)

            if (response.success && response.token && response.user) {
                console.log('Login successful, storing token and redirecting')

                localStorage.setItem("scholarai_token", response.token)
                localStorage.setItem("scholarai_user", JSON.stringify(response.user))
                // Update auth state
                updateAuthState(response.token, response.user)
                navigateWithLoading("/interface/home", "Accessing neural network...")
            }
            else {
                console.error('Login failed:', response)
                setErrors({
                    email: "",
                    password: response.message || "Invalid email or password. Please check your credentials and try again."
                })
            }
        } catch (error) {
            console.error("Login error:", error)
            setErrors({
                email: "",
                password: "An error occurred. Please check your internet connection and try again."
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialLoginSuccess = (data: SocialLoginResponse) => {
        console.log("Social login success in LoginForm:", data)
        if (data.success && data.token && data.user) {
            console.log("Setting localStorage and updating auth state......")
            localStorage.setItem("scholarai_token", data.token)
            localStorage.setItem("scholarai_user", JSON.stringify(data.user))
            updateAuthState(data.token, data.user)
            setSocialLoginSuccessMessage("Login successful! Redirecting...")
            
            // Add a small delay to ensure auth state is updated before navigation
            setTimeout(() => {
                console.log("Navigating to /interface/home...")
                navigateWithLoading('/interface/home', "Accessing neural network...")
            }, 100)
        } else {
            // Handle cases where social login API might return success:false but was handled as success by SocialLogin
            setErrors({
                email: "",
                password: data.message || "Social login failed. Please try again."
            })
        }
    }

    const handleSocialLoginError = (message: string) => {
        console.error("Social login error in LoginForm:", message)
        setErrors({
            email: "", // Or a more generic error field
            password: message || "An error occurred during social login. Please try again."
        })
    }

    /* ────────────────────────────────────────────────────────── */
    /*  JSX                                                      */
    /* ────────────────────────────────────────────────────────── */
    return (
        <div className="w-full min-h-screen flex flex-col px-4 font-['Segoe_UI']">
            <MouseGlitter />
            <div className="flex-1 flex items-center justify-center">
                <div className="max-w-[450px] w-full">
                    <h1 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent drop-shadow-lg">
                        {AUTH_CONSTANTS.loginTitle}
                    </h1>

                    {sessionExpired && (
                        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-md text-white text-sm">
                            Your session has expired. Please log in again to continue.
                        </div>
                    )}

                    {resetSuccess && (
                        <div className="mb-6 p-4 rounded-2xl backdrop-blur-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-primary/10 to-green-500/15 shadow-lg shadow-primary/20 text-white text-base font-['Segoe_UI'] animate-fadeIn relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"></div>
                            <div className="relative z-10 flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="font-medium">Password has been reset successfully! Please log in with your new password.</span>
                            </div>
                        </div>
                    )}

                    {signupSuccess && (
                        <div className="mb-6 p-4 rounded-2xl backdrop-blur-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-primary/10 to-green-500/15 shadow-lg shadow-primary/20 text-white text-base font-['Segoe_UI'] animate-fadeIn relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"></div>
                            <div className="relative z-10 flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="font-medium">Account created successfully! Please log in with your credentials.</span>
                            </div>
                        </div>
                    )}

                    {socialLoginSuccessMessage && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md text-white text-sm">
                            {socialLoginSuccessMessage}
                        </div>
                    )}

                    {/* ----------  THEMED GLASS CARD ---------- */}
                    <div
                        className="rounded-2xl p-10 w-[450px] min-h-[500px] flex flex-col shadow-2xl backdrop-blur-2xl border border-primary/30 bg-gradient-to-br from-background/20 via-background/10 to-primary/5 hover:shadow-primary/30 transition-shadow duration-300"
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                            <div className="space-y-5">
                                <InputField
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    placeholder="youremail@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    required
                                />

                                <PasswordField
                                    id="password"
                                    name="password"
                                    label="Password"
                                    placeholder="••••••••••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    required
                                    showPassword={showPassword}
                                    toggleShowPassword={toggleShowPassword}
                                />

                                <div className="flex items-center justify-between text-base text-white/70 mb-8">
                                    <Checkbox
                                        id="rememberMe"
                                        name="rememberMe"
                                        label={AUTH_CONSTANTS.rememberMe}
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                    />

                                    <Link
                                        href="/forgot-password"
                                        className="text-primary/60 hover:text-primary/80 transition-colors font-['Segoe_UI'] underline underline-offset-2"
                                    >
                                        {AUTH_CONSTANTS.forgotPassword}
                                    </Link>
                                </div>
                            </div>

                            <div className="flex-grow"></div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-[70px] px-4 rounded-2xl font-['Segoe_UI'] font-semibold text-lg text-white shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 border border-primary/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mt-8"
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-6 w-6 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <span className="font-['Segoe_UI']">Logging in...</span>
                                    </>
                                ) : (
                                    <span className="font-['Segoe_UI']">{AUTH_CONSTANTS.loginButton}</span>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="h-[1px] bg-primary/30 w-40"></div>
                            <span className="text-primary/50 text-base font-['Segoe_UI'] whitespace-nowrap">or connect with</span>
                            <div className="h-[1px] bg-primary/30 w-40"></div>
                        </div>
                        <SocialLogin onLoginSuccess={handleSocialLoginSuccess} onLoginError={handleSocialLoginError} />
                    </div>

                    <p className="text-center text-primary/50 text-base mt-8 font-['Segoe_UI']">
                        {AUTH_CONSTANTS.noAccount}{" "}
                        <Link
                            href="/signup"
                            className="relative inline-block text-primary/80 hover:text-primary transition-colors font-medium cursor-pointer underline decoration-primary/50 hover:decoration-primary underline-offset-2"
                        >
                            {AUTH_CONSTANTS.signUpLink}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

const styles = `
@keyframes glitery {
    0% {
        text-shadow: 0 0 4px #7CE495, 0 0 8px #7CE495;
    }
    25% {
        text-shadow: 0 0 8px #7CE495, 0 0 16px #7CE495;
    }
    50% {
        text-shadow: 0 0 4px #7CE495, 0 0 8px #7CE495;
    }
    75% {
        text-shadow: 0 0 8px #7CE495, 0 0 16px #7CE495;
    }
    100% {
        text-shadow: 0 0 4px #7CE495, 0 0 8px #7CE495;
    }
}

.glitery-text {
    animation: glitery 2s infinite;
    position: relative;
}

.glitery-text::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent, rgba(124, 228, 149, 0.2), transparent);
    animation: glitery 2s infinite;
    z-index: -1;
    border-radius: 4px;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
}

.animate-shimmer {
    animation: shimmer 2s infinite;
}

@keyframes fadeOut {
    0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }
}
`

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
}
