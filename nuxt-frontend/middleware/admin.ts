export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo(`/login?redirect=/store-admin`);
  }

  if (!isAdmin.value) {
    return navigateTo('/');
  }
});
