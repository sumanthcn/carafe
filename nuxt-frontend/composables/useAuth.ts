export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export function useAuth() {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  const router = useRouter();
  const route = useRoute();

  const user = useState<User | null>('auth-user', () => null);
  const token = useState<string | null>('auth-token', () => null);
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  /**
   * Initialize auth state from localStorage
   */
  function initAuth() {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('carafe-auth-token');
      const savedUser = localStorage.getItem('carafe-auth-user');
      
      if (savedToken && savedUser) {
        try {
          token.value = savedToken;
          user.value = JSON.parse(savedUser);
        } catch (error) {
          console.error('Failed to parse auth data:', error);
          clearAuth();
        }
      }
    }
  }

  /**
   * Login user
   */
  async function login(identifier: string, password: string) {
    try {
      console.log('Login attempt with:', { identifier, strapiUrl });
      const response = await $fetch<AuthResponse>(`${strapiUrl}/api/auth/local`, {
        method: 'POST',
        body: {
          identifier,
          password,
        },
      });

      // Store auth data
      token.value = response.jwt;
      user.value = response.user;

      // Persist to localStorage
      if (import.meta.client) {
        localStorage.setItem('carafe-auth-token', response.jwt);
        localStorage.setItem('carafe-auth-user', JSON.stringify(response.user));
      }

      return { success: true, user: response.user };
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        status: error?.status,
        statusText: error?.statusText,
        data: error?.data,
        message: error?.message,
      });
      return {
        success: false,
        error: error?.data?.error?.message || error?.data?.message?.[0]?.messages?.[0]?.message || 'Login failed. Please check your credentials.',
      };
    }
  }

  /**
   * Register new user
   */
  async function register(username: string, email: string, password: string) {
    try {
      const response = await $fetch<AuthResponse>(`${strapiUrl}/api/auth/local/register`, {
        method: 'POST',
        body: {
          username,
          email,
          password,
        },
      });

      // Store auth data
      token.value = response.jwt;
      user.value = response.user;

      // Persist to localStorage
      if (import.meta.client) {
        localStorage.setItem('carafe-auth-token', response.jwt);
        localStorage.setItem('carafe-auth-user', JSON.stringify(response.user));
      }

      return { success: true, user: response.user };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error?.data?.error?.message || 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * Logout user
   */
  function logout() {
    user.value = null;
    token.value = null;

    if (import.meta.client) {
      localStorage.removeItem('carafe-auth-token');
      localStorage.removeItem('carafe-auth-user');
    }

    router.push('/');
  }

  /**
   * Clear auth state
   */
  function clearAuth() {
    user.value = null;
    token.value = null;

    if (import.meta.client) {
      localStorage.removeItem('carafe-auth-token');
      localStorage.removeItem('carafe-auth-user');
    }
  }

  /**
   * Get authorization headers for API calls
   */
  function getAuthHeaders(): Record<string, string> {
    if (!token.value) return {};
    return {
      Authorization: `Bearer ${token.value}`,
    };
  }

  /**
   * Check if user has purchased a specific product
   */
  async function hasPurchasedProduct(productId: number): Promise<boolean> {
    if (!isAuthenticated.value) return false;

    try {
      const response = await $fetch<{ hasPurchased: boolean }>(
        `${strapiUrl}/api/orders/check-purchase/${productId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.hasPurchased;
    } catch (error) {
      console.error('Failed to check purchase:', error);
      return false;
    }
  }

  /**
   * Redirect to login with return URL
   */
  function redirectToLogin(returnUrl?: string) {
    const redirect = returnUrl || route.fullPath;
    router.push({
      path: '/login',
      query: { redirect },
    });
  }

  /**
   * Handle post-login redirect
   */
  function handlePostLoginRedirect() {
    const redirect = route.query.redirect as string;
    
    if (redirect && redirect !== '/login' && redirect !== '/signup') {
      console.log('Redirecting to:', redirect);
      // Use window.location for full page reload to avoid dynamic import issues
      if (import.meta.client) {
        window.location.href = redirect;
      }
    } else {
      console.log('Redirecting to home');
      if (import.meta.client) {
        window.location.href = '/';
      }
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
    clearAuth,
    getAuthHeaders,
    hasPurchasedProduct,
    redirectToLogin,
    handlePostLoginRedirect,
  };
}
