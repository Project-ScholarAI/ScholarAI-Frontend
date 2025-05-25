export const initiateGoogleLogin = async () => {
    // TODO: Implement Google OAuth login
    window.location.href = '/api/v1/auth/google'
}

export const initiateGithubLogin = async () => {
    // TODO: Implement GitHub OAuth login
    window.location.href = '/api/v1/auth/github'
}

// Authentication utility functions
export const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('scholarai_token')
    }
    return null
}

export const getUserData = (): any | null => {
    if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('scholarai_user')
        return userData ? JSON.parse(userData) : null
    }
    return null
}

export const clearAuthData = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('scholarai_token')
        localStorage.removeItem('scholarai_user')
    }
}

export const isAuthenticated = (): boolean => {
    return !!getAuthToken()
}

// API request helper with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    }

    return fetch(url, {
        ...options,
        headers
    })
}

export const login = async (formData: { email: string; password: string; rememberMe: boolean }) => {
    try {
        if (!formData.email || !formData.password) {
            throw new Error('Email and password are required')
        }

        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: formData.email.trim(),
                password: formData.password.trim()
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Login failed')
        }

        const token = data.data?.jwtToken || data.data?.apiToken || data.token
        const user = data.data || data.user

        if (!token) {
            throw new Error('No authentication token received')
        }

        return {
            success: true,
            token: token,
            user: user,
            message: data.message
        }
    } catch (error) {
        console.error('Login API error:', error)

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                success: false,
                message: 'Cannot connect to server. Please check if the backend is running.'
            }
        }

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error occurred'
        }
    }
}

export const signup = async (formData: { email: string; password: string; confirmPassword: string; agreeToTerms: boolean }) => {
    try {
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed')
        }

        return {
            success: data.success || true,
            token: data.data?.jwtToken || data.data?.apiToken || data.token,
            user: data.data,
            message: data.message
        }
    } catch (error) {
        console.error('Signup API error:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error occurred'
        }
    }
}

export const logout = async () => {
    try {
        const token = getAuthToken()
        if (token) {
            await authenticatedFetch('/api/v1/auth/logout', {
                method: 'POST'
            })
        }
    } catch (error) {
        console.error('Logout API error:', error)
    } finally {
        clearAuthData()
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }
}
