"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InputField } from "@/components/form/InputField"
import { PasswordField } from "@/components/form/PasswordField"
import { sendResetCode, submitNewPassword } from "@/lib/api"

export default function ForgotPasswordForm() {
    const [step, setStep] = useState<"email" | "reset">("email")
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const router = useRouter()

    const handleSendCode = async () => {
        try {
            await sendResetCode(email)
            setStep("reset")
        } catch (err: any) {
            setError(err.message || "Failed to send code.")
        }
    }

    const handleResetPassword = async () => {
        try {
            await submitNewPassword(email, code, newPassword)
            setSuccessMsg("Password reset successful! You can now log in.")
            setTimeout(() => router.push("/login"), 2000)
        } catch (err: any) {
            setError(err.message || "Failed to reset password.")
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white/10 backdrop-blur rounded-xl text-white">
            <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>

            {error && <div className="mb-4 text-red-400">{error}</div>}
            {successMsg && <div className="mb-4 text-green-400">{successMsg}</div>}

            {step === "email" ? (
                <>
                    <InputField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        required
                    />
                    <button
                        onClick={handleSendCode}
                        className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Send Reset Code
                    </button>
                </>
            ) : (
                <>
                    <InputField
                        id="code"
                        name="code"
                        label="Verification Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter the code sent to your email"
                        required
                    />
                    <PasswordField
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button
                        onClick={handleResetPassword}
                        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reset Password
                    </button>
                </>
            )}
        </div>
    )
}
