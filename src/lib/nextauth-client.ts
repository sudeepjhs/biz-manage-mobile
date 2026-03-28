/**
 * Next-Auth API Client for Mobile
 * Handles authentication flow with Next-Auth Credentials provider
 * 
 * Key differences from standard API client:
 * - Handles Next-Auth session cookies
 * - Calls Next-Auth endpoints directly (/api/auth/*)
 * - Manages JWT tokens from Next-Auth
 */

import { API_BASE_URL, API_ENDPOINTS } from '@config/API';
import axios from 'axios';

export interface NextAuthCredentials {
    email: string;
    password: string;
}

export interface NextAuthUser {
    email: string;
    name: string;
    image?: string;
    role?: string;
}

export interface NextAuthSession {
    user: NextAuthUser;
    accessToken?: string;
    error?: string;
    expires: string;
}

export interface NextAuthSignInResponse {
    ok: boolean;
    error?: string;
    status: number;
    url?: string;
    token?: string;
    user?: any;
}

/**
 * Create Next-Auth API client with cookie support
 * Uses axios to handle Next-Auth session cookies automatically
 */
const NEXTAUTH_CLIENT = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    // CRITICAL: Enable cookies with credentials
    withCredentials: true,
    validateStatus: () => true, // Don't throw on any status
});

/**
 * Sign in with credentials
 * Calls Next-Auth credentials provider endpoint
 * 
 * @param credentials - Email and password
 * @returns Next-Auth response with status
 */
export async function signInWithCredentials(
    credentials: NextAuthCredentials
): Promise<NextAuthSignInResponse> {
    try {
        const response = await NEXTAUTH_CLIENT.post<any>(
            API_ENDPOINTS.AUTH.MOBILE_LOGIN,
            {
                email: credentials.email,
                password: credentials.password,
            }
        );

        if (response.data?.ok) {
            // Success
            return {
                ok: true,
                status: response.status,
                token: response.data.token,
                user: response.data.user
            };
        } else {
            // Authentication failed
            return {
                ok: false,
                error: response.data?.error || 'Authentication failed',
                status: response.status,
            };
        }
    } catch (error: any) {
        console.error('Sign in error:', error);
        return {
            ok: false,
            error: error.response?.data?.error || error.message || 'Network error',
            status: error.response?.status || 0,
        };
    }
}

/**
 * Get current session
 * Retrieves user data and tokens from Next-Auth session
 * 
 * @returns Current session data or null if not authenticated
 */
export async function getSessionData(): Promise<NextAuthSession | null> {
    try {
        const response = await NEXTAUTH_CLIENT.get<NextAuthSession>(
            API_ENDPOINTS.AUTH.NEXTAUTH_SESSION
        );

        if (response.status === 200 && response.data?.user) {
            return response.data;
        }
        return null;
    } catch (error: any) {
        console.error('Get session error:', error);
        return null;
    }
}

/**
 * Sign out from Next-Auth
 * Clears session and cookies
 */
export async function signOutFromNextAuth(): Promise<void> {
    try {
        await NEXTAUTH_CLIENT.post(API_ENDPOINTS.AUTH.NEXTAUTH_SIGNOUT, {});
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

/**
 * Get CSRF token for protected requests
 * Next-Auth uses CSRF tokens for certain operations
 */
export async function getCsrfToken(): Promise<string | null> {
    try {
        const response = await NEXTAUTH_CLIENT.get<{ csrfToken: string }>(
            API_ENDPOINTS.AUTH.NEXTAUTH_CSRF
        );
        return response.data?.csrfToken || null;
    } catch (error) {
        console.error('Get CSRF token error:', error);
        return null;
    }
}

export default NEXTAUTH_CLIENT;
