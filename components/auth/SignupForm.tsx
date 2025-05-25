"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { InputField } from "@/components/form/InputField"
import { PasswordField } from "@/components/form/PasswordField"
import { Checkbox } from "@/components/form/Checkbox"
import { AUTH_CONSTANTS } from "@/constants/auth"
import { signup } from "@/lib/api"
import type { SignupFormData } from "@/types/auth"
import SocialLogin from "./SocialLogin"

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

export function SignupForm() {
    const [formData, setFormData] = useState<SignupFormData>({
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    })

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    /* ────────────────────────────────────────────────────────── */
    /*  Handlers                                                 */
    /* ────────────────────────────────────────────────────────── */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
        if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const toggleShowPassword = () => setShowPassword((prev) => !prev)
    const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev)

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
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
            valid = false
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
            valid = false
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
            valid = false
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = "You must agree to the terms and conditions"
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        try {
            const response = await signup(formData)
            if (response.success) {
                // Don't auto-login, redirect to login page with success message
                router.push("/login?signup=success")
            } else {
                setErrors({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    agreeToTerms: response.message || "An error occurred during signup"
                })
            }
        } catch (error) {
            console.error("Signup error:", error)
            setErrors({
                email: "",
                password: "",
                confirmPassword: "",
                agreeToTerms: "An error occurred. Please try again."
            })
        } finally {
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
                        {AUTH_CONSTANTS.signupTitle}
                    </h1>

                    {/* -------------  SIGNUP CARD ------------- */}
                    <div
                        className="backdrop-blur-xl rounded-2xl p-6 border w-[450px] min-h-[500px] flex flex-col shadow-2xl"
                        style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1.5px solid rgba(255, 255, 255, 0.35)",
                            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                        }}
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                            <div className="space-y-3">
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

                                <PasswordField
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    placeholder="••••••••••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    required
                                    showPassword={showConfirmPassword}
                                    toggleShowPassword={toggleShowConfirmPassword}
                                />

                                <div className="mb-3">
                                    <Checkbox
                                        id="agreeToTerms"
                                        name="agreeToTerms"
                                        label={AUTH_CONSTANTS.agreeToTerms}
                                        checked={formData.agreeToTerms}
                                        onChange={handleChange}
                                    />
                                    {errors.agreeToTerms && (
                                        <p className="text-red-400 text-sm mt-1">{errors.agreeToTerms}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex-grow"></div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-[55px] px-4 rounded-2xl font-['Segoe_UI'] font-medium transition-colors text-xl
                                    bg-white/30 text-[#043434] hover:bg-white/50 border border-white/40 shadow-md
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center mt-3 backdrop-blur-md"
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
                                        <span className="font-['Segoe_UI']">Creating account...</span>
                                    </>
                                ) : (
                                    <span className="font-['Segoe_UI']">{AUTH_CONSTANTS.signupButton}</span>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="h-[1px] bg-white/20 w-40"></div>
                            <span className="text-shiny text-base font-['Segoe_UI'] whitespace-nowrap">or connect with</span>
                            <div className="h-[1px] bg-white/20 w-40"></div>
                        </div>
                        <SocialLogin />
                    </div>

                    <p className="text-center text-shiny text-base mt-6 font-['Segoe_UI']">
                        {AUTH_CONSTANTS.haveAccount}{" "}
                        <Link
                            href="/login"
                            className="relative inline-block text-[#7CE495] hover:text-[#6AD084] transition-colors glitery-text"
                        >
                            {AUTH_CONSTANTS.loginLink}
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