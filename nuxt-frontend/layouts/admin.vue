<script setup lang="ts">
const { user, isAdmin, logout } = useAuth();
const route = useRoute();

const navItems = [
  { label: 'Dashboard',   icon: '📊', path: '/store-admin' },
  { label: 'Orders',      icon: '📦', path: '/store-admin/orders' },
  { label: 'Products',    icon: '☕', path: '/store-admin/products' },
  { label: 'Categories',  icon: '🗂️', path: '/store-admin/categories' },
  { label: 'Users',       icon: '👥', path: '/store-admin/users' },
  { label: 'Subscribers', icon: '✉️', path: '/store-admin/subscribers' },
];

const isSidebarOpen = ref(true);

function isActive(path: string) {
  if (path === '/store-admin') return route.path === '/store-admin';
  return route.path.startsWith(path);
}
</script>

<template>
  <div class="admin-shell">
    <!-- Sidebar -->
    <aside :class="['admin-sidebar', { 'admin-sidebar--collapsed': !isSidebarOpen }]">
      <div class="sidebar-header">
        <NuxtLink to="/store-admin" class="sidebar-logo">
          <span class="sidebar-logo__icon">☕</span>
          <span v-if="isSidebarOpen" class="sidebar-logo__name">Carafe Admin</span>
        </NuxtLink>
        <button class="sidebar-toggle" @click="isSidebarOpen = !isSidebarOpen">
          {{ isSidebarOpen ? '◀' : '▶' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['sidebar-nav__item', { active: isActive(item.path) }]"
        >
          <span class="sidebar-nav__icon">{{ item.icon }}</span>
          <span v-if="isSidebarOpen" class="sidebar-nav__label">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink to="/" target="_blank" class="sidebar-nav__item">
          <span class="sidebar-nav__icon">🌐</span>
          <span v-if="isSidebarOpen" class="sidebar-nav__label">View Site</span>
        </NuxtLink>
        <button class="sidebar-nav__item sidebar-nav__item--logout" @click="logout">
          <span class="sidebar-nav__icon">🚪</span>
          <span v-if="isSidebarOpen" class="sidebar-nav__label">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="admin-topbar__left">
          <button class="mobile-menu-btn" @click="isSidebarOpen = !isSidebarOpen">☰</button>
        </div>
        <div class="admin-topbar__right">
          <span class="topbar-user">{{ user?.username }}</span>
          <span class="topbar-role">Admin</span>
        </div>
      </header>

      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.admin-sidebar {
  width: 240px;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  overflow: hidden;

  &--collapsed {
    width: 60px;
  }

  @media (max-width: 768px) {
    width: 60px;

    &:not(.admin-sidebar--collapsed) {
      width: 240px;
      box-shadow: 4px 0 20px rgba(0,0,0,.4);
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,.1);
  min-height: 68px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;

  &__icon { font-size: 1.4rem; flex-shrink: 0; }
}

.sidebar-toggle {
  background: none;
  border: none;
  color: rgba(255,255,255,.5);
  cursor: pointer;
  font-size: 0.75rem;
  flex-shrink: 0;
  padding: 4px;

  &:hover { color: white; }
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: rgba(255,255,255,.7);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: rgba(255,255,255,.08);
    color: white;
  }

  &.active {
    background: rgba(99,102,241,.25);
    color: #a5b4fc;
    border-left: 3px solid #6366f1;
  }

  &--logout { color: #fca5a5; &:hover { background: rgba(239,68,68,.15); color: #f87171; } }
}

.sidebar-nav__icon { font-size: 1.1rem; flex-shrink: 0; width: 24px; text-align: center; }

.sidebar-footer {
  border-top: 1px solid rgba(255,255,255,.1);
  padding: 0.5rem 0;
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.25s ease;

  .admin-sidebar--collapsed ~ & {
    margin-left: 60px;
  }

  @media (max-width: 768px) {
    margin-left: 60px;
  }
}

.admin-topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;

  &__right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
}

.mobile-menu-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
  display: none;

  @media (max-width: 768px) { display: block; }
}

.topbar-user { font-weight: 600; font-size: 0.875rem; color: #1e293b; }
.topbar-role {
  background: #ede9fe; color: #6d28d9;
  font-size: 0.7rem; font-weight: 700;
  padding: 2px 8px; border-radius: 999px;
}

.admin-content {
  padding: 2rem 1.5rem;
  flex: 1;
}

@media print {
  .admin-sidebar,
  .admin-topbar,
  .sidebar-toggle { display: none !important; }

  .admin-main {
    margin-left: 0 !important;
    padding: 0 !important;
  }

  .admin-shell {
    display: block !important;
  }

  .admin-content {
    padding: 0 !important;
  }
}
</style>
