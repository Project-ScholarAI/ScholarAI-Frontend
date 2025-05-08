export const initiateGoogleLogin = async () => {
    // TODO: Implement Google OAuth login
    window.location.href = '/api/auth/google'
}

export const initiateGithubLogin = async () => {
    // TODO: Implement GitHub OAuth login
    window.location.href = '/api/auth/github'
}

export const login = async (formData: { email: string; password: string; rememberMe: boolean }) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    return response.json()
}
