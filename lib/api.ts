export const initiateGoogleLogin = async () => {
    // TODO: Implement Google OAuth login
    window.location.href = 'https://accounts.google.com/gsi/client'
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
        localStorage.removeItem('scholarai_refresh_token')
    }
}

export const isAuthenticated = (): boolean => {
    return !!getAuthToken()
}


export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const response = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            credentials: 'include', // for cookie
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken: '' }) // backend expects this field in body
        });

        const data = await response.json();

        if (response.ok && data.data?.accessToken) {
            localStorage.setItem('scholarai_token', data.data.accessToken);
            return data.data.accessToken;
        } else {
            console.warn('Refresh token invalid or expired');
            clearAuthData();
            return null;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        clearAuthData();
        return null;
    }
};


// API request helper with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    let token = getAuthToken()
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  
    const response = await fetch(url, {
      ...options,
      headers
    })
  
    if (response.status === 401) {

        console.log('Access token expired, refreshing...');
      // Try to refresh token
      const newAccessToken = await refreshAccessToken()
      if (newAccessToken) {
        const retryHeaders = {
          ...headers,
          'Authorization': `Bearer ${newAccessToken}`
        }
  
        return fetch(url, {
          ...options,
          headers: retryHeaders
        })
      }
    }
  
    return response;

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
            }),
            credentials: 'include' //allows storing refresh token in cookies
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Login failed')
        }
        else{
            console.log("response:", data);
        }

        const token = data.data?.accessToken;
        const user = {
            id: data.data?.userId,
            email: data.data?.email,
            roles: data.data?.roles
        }

        if (!token) {
            throw new Error('No access token received')
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
           
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        return {
            success: true,
            message: data.message || 'Registration successful'
        };
    } catch (error) {
        console.error('Signup API error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error occurred'
        };
    }
};



export const logout = async () => {
    try {
        await fetch('/api/v1/auth/logout', {
            method: 'POST',
            credentials: 'include' // include the refresh token cookie
        })
    } catch (error) {
        console.error('Logout API error:', error)
    } finally {
        clearAuthData()
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }
}

export const sendResetCode = async (email: string) => {
    const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }),
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Error sending code")
    }
}

export const submitNewPassword = async (email: string, code: string, newPassword: string) => {
    const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, code, newPassword }),
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Error resetting password")
    }
}

export interface SocialLoginResponse {
    success: boolean;
    message: string;
    token?: string; // Corresponds to accessToken
    refreshToken?: string; // Optional: if backend sends it in body
    user?: {
        id: string;
        email: string;
        roles: string[];
    };
}

export const handleGoogleSocialLogin = async (idToken: string): Promise<SocialLoginResponse> => {
    try {
        const response = await fetch('/api/v1/auth/social-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ idToken })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Social login failed');
        }

        const accessToken = data.data?.accessToken;
        const refreshToken = data.data?.refreshToken; // Assuming backend might send this
        const user = {
            id: data.data?.userId,
            email: data.data?.email,
            roles: data.data?.roles
        };

        if (!accessToken) {
            throw new Error('No access token received from social login');
        }

        // Store access token
        localStorage.setItem('scholarai_token', accessToken);
        
        // Store user data
        if (user && user.id) {
            localStorage.setItem('scholarai_user', JSON.stringify(user));
        }

        // Store refresh token if provided in response body
        if (refreshToken) {
            localStorage.setItem('scholarai_refresh_token', refreshToken); // Using a new key for clarity
        }


        return {
            success: true,
            token: accessToken,
            user: user,
            message: data.message || 'Social login successful'
        };

    } catch (error) {
        console.error('Social Login API error:', error);
        // Clear any partial auth data if login failed
        clearAuthData(); 
        // Also clear the potential refresh token from local storage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('scholarai_refresh_token');
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                success: false,
                message: 'Cannot connect to server. Please check if the backend is running.'
            };
        }

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error occurred during social login'
        };
    }
};


