import { GoogleIcon } from '@/components/icons/GoogleIcon'
import { GithubIcon } from '@/components/icons/GithubIcon'
import { MailIcon } from '@/components/icons/MailIcon'
import { initiateGoogleLogin, initiateGithubLogin } from '@/lib/api'

interface SocialLoginProps {
    className?: string
}

export default function SocialLogin({ className = '' }: SocialLoginProps) {
    const handleGoogleLogin = async () => {
        await initiateGoogleLogin()
    }

    const handleGithubLogin = async () => {
        await initiateGithubLogin()
    }

    return (
        <div className={`flex justify-center items-center gap-x-9 ${className}`}>
            <button
                onClick={handleGoogleLogin}
                aria-label="Login with Google"
                className="w-[80px] h-[80px] flex items-center justify-center rounded-lg bg-white/10 border border-white/40 shadow-md hover:bg-white/50 transition-all duration-200"
            >
                <GoogleIcon />
            </button>

            <button
                onClick={handleGithubLogin}
                aria-label="Login with GitHub"
                className="w-[80px] h-[80px] flex items-center justify-center rounded-lg bg-white/10 border border-white/40 shadow-md hover:bg-white/50 transition-all duration-200"
            >
                <GithubIcon />
            </button>

            <button
                aria-label="Login with Email"
                className="w-[80px] h-[80px] flex items-center justify-center rounded-lg bg-white/50 border border-white/40 shadow-md transition-all duration-200"
            >
                <MailIcon />
            </button>
        </div>
    )
}
