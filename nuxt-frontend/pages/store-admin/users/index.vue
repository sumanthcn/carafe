<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const config = useRuntimeConfig();
const { getAuthHeaders } = useAuth();

const users = ref<any[]>([]);
const loading = ref(true);
const toast = ref('');
const search = ref('');

async function load() {
  loading.value = true;
  try {
    const res = await $fetch<any>(
      `${config.public.strapiUrl}/api/users?populate=role&sort=createdAt:desc&pagination[limit]=200`,
      { headers: getAuthHeaders() }
    );
    users.value = Array.isArray(res) ? res : (res?.data ?? []);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

const filtered = computed(() => {
  if (!search.value.trim()) return users.value;
  const q = search.value.toLowerCase();
  return users.value.filter(u =>
    u.username?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q)
  );
});

async function toggleBlock(u: any) {
  const action = u.blocked ? 'unblock' : 'block';
  if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${u.username}?`)) return;
  await $fetch(`${config.public.strapiUrl}/api/users/${u.id}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: { blocked: !u.blocked },
  });
  toast.value = `User ${action}ed`;
  setTimeout(() => toast.value = '', 3000);
  await load();
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Users</h1>
        <p>{{ users.length }} registered user{{ users.length !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>

    <div class="toolbar">
      <input v-model="search" class="search-input" placeholder="Search by name or email…" />
    </div>

    <div class="table-card">
      <div v-if="loading" class="empty-msg">Loading…</div>
      <table v-else-if="filtered.length" class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Confirmed</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.id">
            <td>{{ u.id }}</td>
            <td><strong>{{ u.username }}</strong></td>
            <td>{{ u.email }}</td>
            <td>
              <span class="badge badge--purple">{{ u.role?.name || 'Authenticated' }}</span>
            </td>
            <td>
              <span :class="u.confirmed ? 'badge badge--green' : 'badge badge--gray'">
                {{ u.confirmed ? 'Yes' : 'No' }}
              </span>
            </td>
            <td>
              <span :class="u.blocked ? 'badge badge--red' : 'badge badge--green'">
                {{ u.blocked ? 'Blocked' : 'Active' }}
              </span>
            </td>
            <td>{{ new Date(u.createdAt).toLocaleDateString('en-GB') }}</td>
            <td>
              <button :class="['btn-action', u.blocked ? 'btn-action--green' : 'btn-action--red']" @click="toggleBlock(u)">
                {{ u.blocked ? 'Unblock' : 'Block' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-msg">No users found.</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1.5rem;
  h1 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0 0 .2rem; }
  p  { color: #64748b; font-size: .875rem; margin: 0; }
}
.toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  background: #1e293b; color: white; padding: .75rem 1.25rem;
  border-radius: 8px; font-size: .875rem; z-index: 200;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
}
.toolbar { margin-bottom: 1rem; }
.search-input {
  padding: .65rem 1rem; border: 1.5px solid #d1d5db; border-radius: 8px;
  font-size: .875rem; width: 300px; max-width: 100%;
  &:focus { outline: none; border-color: #6366f1; }
}
.table-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); overflow: hidden; }
.data-table {
  width: 100%; border-collapse: collapse;
  th, td { padding: .75rem 1.25rem; text-align: left; font-size: .875rem; white-space: nowrap; }
  th { color: #64748b; font-weight: 600; font-size: .72rem; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
  tr:not(:last-child) td { border-bottom: 1px solid #f8fafc; }
}
.badge {
  display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .72rem; font-weight: 600;
  &--green  { background: #dcfce7; color: #166534; }
  &--gray   { background: #f1f5f9; color: #475569; }
  &--red    { background: #fee2e2; color: #991b1b; }
  &--purple { background: #ede9fe; color: #6d28d9; }
}
.btn-action {
  padding: .3rem .8rem; border: none; border-radius: 6px;
  font-size: .75rem; font-weight: 600; cursor: pointer;
  &--red   { background: #fee2e2; color: #991b1b; &:hover { background: #fecaca; } }
  &--green { background: #dcfce7; color: #166534; &:hover { background: #bbf7d0; } }
}
.empty-msg { padding: 3rem; text-align: center; color: #94a3b8; }
</style>
