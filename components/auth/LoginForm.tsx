"use client"

import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { InputField } from "@/components/form/InputField"
import { PasswordField } from "@/components/form/PasswordField"
import { Checkbox } from "@/components/form/Checkbox"
import { AUTH_CONSTANTS } from "@/constants/auth"
import { login } from "@/lib/api"
import type { LoginFormData } from "@/types/auth"
import SocialLogin from "./SocialLogin"
import { useAuth } from "@/hooks/useAuth"

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
                    className="absolute w-2 h-2 rounded-full bg-white/80"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        transform: 'translate(-50%, -50%)',
                        animation: 'fadeOut 1s forwards',
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
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
    const [loginStatus, setLoginStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { updateAuthState } = useAuth()

    /* ────────────────────────────────────────────────────────── */
    /*  Handlers                                                 */
    /* ────────────────────────────────────────────────────────── */
    useEffect(() => {
        if (searchParams.get("session") === "expired") setSessionExpired(true)
        if (searchParams.get("signup") === "success") setSignupSuccess(true)
    }, [searchParams])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
        if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: "" }))
        if (sessionExpired) setSessionExpired(false)
        if (signupSuccess) setSignupSuccess(false)
        if (loginStatus) setLoginStatus(null)
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
        setLoginStatus(null)
        if (!validateForm()) return

        setIsLoading(true)
        console.log('Form submission started')
        console.log('Submitting with email:', formData.email)
        console.log('Submitting with password length:', formData.password.length)

        try {
            const response = await login(formData)
            console.log('Login response received:', response)

            if (response.success && response.token) {
                console.log('Login successful, storing token and preparing to redirect')
                setLoginStatus({ message: response.message || "Login successful! Redirecting...", type: 'success' })
                localStorage.setItem("scholarai_token", response.token)
                // Store user data if available
                if (response.user) {
                    localStorage.setItem("scholarai_user", JSON.stringify(response.user))
                }
                // Update auth state
                updateAuthState(response.token, response.user)
                setTimeout(() => {
                    router.push("/interface/home")
                }, 2000)
            } else {
                console.error('Login failed:', response)
                setLoginStatus({ message: response.message || "Invalid email or password. Please check your credentials and try again.", type: 'error' })
                setIsLoading(false)
            }
        } catch (error) {
            console.error("Login error:", error)
            setLoginStatus({ message: "An error occurred. Please check your internet connection and try again.", type: 'error' })
            setIsLoading(false)
        }
    }

    /* ────────────────────────────────────────────────────────── */
    /*  JSX                                                      */
    /* ────────────────────────────────────────────────────────── */
    return (
        <div className="w-full min-h-screen flex flex-col px-4 font-['Segoe_UI']">
            <MouseGlitter />
            <div className="flex-1 flex items-center justify-center">
                <div className="max-w-[450px] w-full">
                    <h1 className="text-2xl font-bold text-center text-white/70 mb-4 backdrop-blur-sm">
                        {AUTH_CONSTANTS.loginTitle}
                    </h1>

                    {sessionExpired && (
                        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-md text-white text-sm">
                            Your session has expired. Please log in again to continue.
                        </div>
                    )}

                    {signupSuccess && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md text-white text-sm">
                            Account created successfully! Please log in with your credentials.
                        </div>
                    )}

                    {/* Display Login Status Message */}
                    {loginStatus && (
                        <div className={`mb-4 p-3 border rounded-md text-white text-sm ${
                            loginStatus.type === 'success' ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
                        }`}>
                            {loginStatus.message}
                        </div>
                    )}

                    {/* -------------  LOGIN CARD ------------- */}
                    <div
                        className="backdrop-blur-xl rounded-2xl p-8 border w-[450px] min-h-[460px] flex flex-col shadow-2xl"
                        style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1.5px solid rgba(255, 255, 255, 0.35)",
                            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                        }}
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
                                        className="hover:text-green-400 transition-colors font-['Segoe_UI'] underline underline-offset-2"
                                    >
                                        {AUTH_CONSTANTS.forgotPassword}
                                    </Link>
                                </div>
                            </div>

                            <div className="flex-grow"></div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-[70px] px-4 rounded-2xl font-['Segoe_UI'] font-medium transition-colors text-xl
                                    bg-white/30 text-[#043434] hover:bg-white/50 border border-white/40 shadow-md
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center mt-4 backdrop-blur-md"
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-6 w-6 text-[#043434]"
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
                            <div className="h-[1px] bg-white/20 w-40"></div>
                            <span className="text-shiny text-base font-['Segoe_UI'] whitespace-nowrap">or connect with</span>
                            <div className="h-[1px] bg-white/20 w-40"></div>
                        </div>
                        <SocialLogin />
                    </div>

                    <p className="text-center text-shiny text-base mt-8 font-['Segoe_UI']">
                        {AUTH_CONSTANTS.noAccount}{" "}
                        <Link
                            href="/signup"
                            className="relative inline-block text-[#7CE495] hover:text-[#6AD084] transition-colors glitery-text"
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
