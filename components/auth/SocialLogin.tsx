import { GoogleIcon } from '@/components/icons/GoogleIcon'
import { GithubIcon } from '@/components/icons/GithubIcon'
import { MailIcon } from '@/components/icons/MailIcon'
import { initiateGithubLogin, handleGoogleSocialLogin, type SocialLoginResponse } from '@/lib/api'
import { useEffect, useRef } from 'react'

interface SocialLoginProps {
    className?: string
    onLoginSuccess?: (data: SocialLoginResponse) => void
    onLoginError?: (message: string) => void
}

export default function SocialLogin({ className = '', onLoginSuccess, onLoginError }: SocialLoginProps) {
    const googleButtonDiv = useRef<HTMLDivElement>(null)
    const scriptLoaded = useRef(false)

    const handleGoogleCallback = async (response: any) => {
        console.log("Google credential response:", response)
        if (response.credential) {
            try {
                const result = await handleGoogleSocialLogin(response.credential)
                if (result.success) {
                    console.log('✅ Google Login Success via API', result)
                    if (onLoginSuccess) {
                        onLoginSuccess(result)
                    }
                } else {
                    console.error('❌ Google Login Failed via API', result.message)
                    if (onLoginError) {
                        onLoginError(result.message || 'Google login failed')
                    }
                }
            } catch (error: any) {
                console.error('❌ Google Login Exception', error)
                if (onLoginError) {
                    onLoginError(error.message || 'An unexpected error occurred during Google login')
                }
            }
        } else {
            console.error('Google Sign-In did not return a credential.')
            if (onLoginError) {
                onLoginError('Google Sign-In did not return a credential.')
            }
        }
    }
    
    useEffect(() => {
        // @ts-ignore
        window.handleGoogleCredentialResponse = handleGoogleCallback
        return () => {
            // @ts-ignore
            delete window.handleGoogleCredentialResponse
        }
    }, [onLoginSuccess, onLoginError])

    useEffect(() => {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

        if (!googleClientId) {
            console.error("Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.")
            if (onLoginError) onLoginError("Google login is not configured.")
            return
        }

        if (scriptLoaded.current) {
            if (googleButtonDiv.current && window.google) {
                window.google.accounts.id.renderButton(
                    googleButtonDiv.current,
                    { theme: "outline", size: "large", type: "standard", text: "signin_with" } 
                )
            }
            return
        }
        
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
            scriptLoaded.current = true
            if (!window.google || !window.google.accounts || !window.google.accounts.id) {
                console.error('Google GSI script loaded but window.google.accounts.id not available.')
                if (onLoginError) onLoginError("Failed to initialize Google Login.")
                return
            }
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleCallback
            })
            if (googleButtonDiv.current) {
                window.google.accounts.id.renderButton(
                    googleButtonDiv.current,
                    { theme: "outline", size: "large", type: "standard", text: "signin_with"} 
                )
            }
        }
        script.onerror = () => {
            console.error("Failed to load Google GSI script.")
            if (onLoginError) onLoginError("Failed to load Google Sign-In script.")
        }
        document.head.appendChild(script)

        return () => {
            // Optional: Clean up script if component unmounts, though GSI script is usually loaded once.
            // document.head.removeChild(script); // Be cautious with this if other components might use it.
        }
    }, [onLoginError])

    const handleGithubLogin = async () => {
        await initiateGithubLogin()
    }

    return (
        <div className={`flex flex-col items-center gap-y-4 ${className}`}>
            <div ref={googleButtonDiv} id="g_id_signin" className="g_id_signin"></div>
            
            <button
                onClick={handleGithubLogin}
                aria-label="Login with GitHub"
                className="w-[260px] h-[40px] flex items-center justify-center rounded-lg bg-white/10 border border-white/40 shadow-md hover:bg-white/20 transition-all duration-200"
            >
                <GithubIcon /> <span className="ml-2">Sign in with GitHub</span>
            </button>

            <button
                aria-label="Login with Email"
                className="w-[260px] h-[40px] flex items-center justify-center rounded-lg bg-white/10 border border-white/40 shadow-md hover:bg-white/20 transition-all duration-200"
                onClick={() => alert("Email login form should be shown.")}
            >
                <MailIcon /> <span className="ml-2">Sign in with Email</span>
            </button>
        </div>
    )
}

declare global {
    interface Window {
        google: any
        handleGoogleCredentialResponse?: (response: any) => void
    }
}
