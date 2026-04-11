<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const config = useRuntimeConfig();
const { getAuthHeaders } = useAuth();

const subscribers = ref<any[]>([]);
const loading = ref(true);
const toast = ref('');
const search = ref('');
const filterActive = ref<'all' | 'active' | 'inactive'>('all');
const page = ref(1);
const pageSize = 50;
const total = ref(0);

async function load() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      'sort': 'createdAt:desc',
      'pagination[page]': String(page.value),
      'pagination[pageSize]': String(pageSize),
    });
    if (filterActive.value === 'active') params.set('filters[isActive][$eq]', 'true');
    if (filterActive.value === 'inactive') params.set('filters[isActive][$eq]', 'false');

    const res = await $fetch<any>(
      `${config.public.strapiUrl}/api/email-subscribers?${params}`,
      { headers: getAuthHeaders() }
    );
    subscribers.value = (res?.data ?? []).map((i: any) => i.attributes ? { id: i.id, ...i.attributes } : { ...i });
    total.value = res?.meta?.pagination?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch([filterActive, page], load);

const filtered = computed(() => {
  if (!search.value.trim()) return subscribers.value;
  const q = search.value.toLowerCase();
  return subscribers.value.filter(s => s.email?.toLowerCase().includes(q));
});

async function toggleActive(s: any) {
  await $fetch(`${config.public.strapiUrl}/api/email-subscribers/${s.id}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: { data: { isActive: !s.isActive } },
  });
  toast.value = s.isActive ? 'Subscriber deactivated' : 'Subscriber reactivated';
  setTimeout(() => toast.value = '', 3000);
  await load();
}

async function remove(id: number) {
  if (!confirm('Delete this subscriber?')) return;
  await $fetch(`${config.public.strapiUrl}/api/email-subscribers/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  toast.value = 'Subscriber deleted';
  setTimeout(() => toast.value = '', 3000);
  await load();
}

function exportCsv() {
  const rows = [['Email', 'Source', 'Active', 'Subscribed']];
  subscribers.value.forEach(s => rows.push([s.email, s.source || '', s.isActive ? 'Yes' : 'No', new Date(s.createdAt).toLocaleDateString('en-GB')]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `subscribers-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

const totalPages = computed(() => Math.ceil(total.value / pageSize));
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Email Subscribers</h1>
        <p>{{ total }} subscriber{{ total !== 1 ? 's' : '' }} total</p>
      </div>
      <button class="btn-secondary" @click="exportCsv">⬇ Export CSV</button>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>

    <div class="toolbar">
      <input v-model="search" class="search-input" placeholder="Search email…" />
      <div class="filter-tabs">
        <button :class="['filter-tab', { active: filterActive === 'all' }]" @click="filterActive = 'all'; page = 1">All</button>
        <button :class="['filter-tab', { active: filterActive === 'active' }]" @click="filterActive = 'active'; page = 1">Active</button>
        <button :class="['filter-tab', { active: filterActive === 'inactive' }]" @click="filterActive = 'inactive'; page = 1">Inactive</button>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading" class="empty-msg">Loading…</div>
      <table v-else-if="filtered.length" class="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Source</th>
            <th>Status</th>
            <th>Subscribed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id">
            <td>{{ s.email }}</td>
            <td>{{ s.source || '—' }}</td>
            <td>
              <span :class="s.isActive !== false ? 'badge badge--green' : 'badge badge--gray'">
                {{ s.isActive !== false ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ new Date(s.createdAt).toLocaleDateString('en-GB') }}</td>
            <td class="actions">
              <button class="btn-action btn-action--gray" @click="toggleActive(s)">
                {{ s.isActive !== false ? 'Deactivate' : 'Reactivate' }}
              </button>
              <button class="btn-icon btn-icon--danger" @click="remove(s.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-msg">No subscribers found.</div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="page <= 1" @click="page--">‹ Prev</button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++">Next ›</button>
      </div>
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
.btn-secondary {
  background: white; color: #374151; border: 1.5px solid #d1d5db; border-radius: 8px;
  padding: .6rem 1.2rem; font-weight: 600; cursor: pointer; font-size: .875rem;
  &:hover { background: #f9fafb; }
}
.toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  background: #1e293b; color: white; padding: .75rem 1.25rem;
  border-radius: 8px; font-size: .875rem; z-index: 200;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
}
.toolbar {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;
}
.search-input {
  padding: .65rem 1rem; border: 1.5px solid #d1d5db; border-radius: 8px;
  font-size: .875rem; width: 260px; max-width: 100%;
  &:focus { outline: none; border-color: #6366f1; }
}
.filter-tabs { display: flex; gap: .35rem; }
.filter-tab {
  padding: .5rem .9rem; border: 1.5px solid #d1d5db; border-radius: 8px;
  background: white; font-size: .8rem; font-weight: 600; cursor: pointer; color: #374151;
  &.active { background: #6366f1; color: white; border-color: #6366f1; }
  &:hover:not(.active) { background: #f9fafb; }
}
.table-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); overflow: hidden; }
.data-table {
  width: 100%; border-collapse: collapse;
  th, td { padding: .75rem 1.25rem; text-align: left; font-size: .875rem; }
  th { color: #64748b; font-weight: 600; font-size: .72rem; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
  tr:not(:last-child) td { border-bottom: 1px solid #f8fafc; }
}
.badge {
  display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .72rem; font-weight: 600;
  &--green { background: #dcfce7; color: #166534; }
  &--gray  { background: #f1f5f9; color: #475569; }
}
.actions { display: flex; gap: .4rem; align-items: center; }
.btn-action {
  padding: .3rem .8rem; border: none; border-radius: 6px;
  font-size: .75rem; font-weight: 600; cursor: pointer;
  &--gray { background: #f1f5f9; color: #374151; &:hover { background: #e2e8f0; } }
}
.btn-icon {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
  padding: .3rem .5rem; cursor: pointer; font-size: .9rem;
  &--danger:hover { background: #fee2e2; }
}
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 1rem;
  padding: 1rem; border-top: 1px solid #f1f5f9; font-size: .875rem;
  button {
    padding: .4rem .9rem; border: 1.5px solid #d1d5db; border-radius: 6px;
    background: white; cursor: pointer; font-weight: 600;
    &:disabled { opacity: .4; cursor: not-allowed; }
    &:hover:not(:disabled) { background: #f1f5f9; }
  }
}
.empty-msg { padding: 3rem; text-align: center; color: #94a3b8; }
</style>
