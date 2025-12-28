export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, redirectToLogin } = useAuth();

  console.log('Auth middleware - isAuthenticated:', isAuthenticated.value, 'to:', to.fullPath);

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated.value) {
    console.log('Not authenticated, redirecting to login with returnUrl:', to.fullPath);
    redirectToLogin(to.fullPath);
    return false;
  }
  
  console.log('User is authenticated, allowing access');
});
