export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side (only run on client)
  if (import.meta.server) {
    return;
  }
  
  // Check localStorage directly
  const hasToken = localStorage.getItem('carafe-auth-token');
  const hasUser = localStorage.getItem('carafe-auth-user');
  
  if (hasToken && hasUser) {
    console.log('Auth middleware - User authenticated from localStorage');
    return; // Allow access
  }
  
  // Double-check with reactive state
  const { isAuthenticated } = useAuth();

  console.log('Auth middleware - isAuthenticated:', isAuthenticated.value, 'to:', to.fullPath);

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated.value) {
    console.log('Not authenticated, redirecting to login');
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
  
  console.log('User is authenticated, allowing access');
});
