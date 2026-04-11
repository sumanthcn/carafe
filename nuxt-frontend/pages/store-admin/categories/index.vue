<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

const config = useRuntimeConfig();
const { getAuthHeaders } = useAuth();
const strapiUrl = config.public.strapiUrl;

const categories = ref<any[]>([]);
const loading    = ref(true);
const saving     = ref(false);
const toast      = ref("");
const toastOk    = ref(true);
const showForm   = ref(false);
const editingId          = ref<number | null>(null);
const editingDocumentId  = ref<string | null>(null);
const activeTab          = ref("basic");

const form = reactive<any>({
  name: "", slug: "", description: "", displayOrder: 0, isActive: true,
  seo: { metaTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogType: "website", twitterCard: "summary_large_image", noIndex: false, noFollow: false },
  existingIcon: null, newIconFile: null as File | null, newIconPreview: "", removeIcon: false,
  existingImage: null, newImageFile: null as File | null, newImagePreview: "", removeImage: false,
});

function autoSlug() { if (!editingId.value) form.slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }

function onIconChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  form.newIconFile = f;
  form.removeIcon = false;
  const reader = new FileReader();
  reader.onload = (ev: any) => form.newIconPreview = ev.target.result as string;
  reader.readAsDataURL(f);
}
function onImageChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  form.newImageFile = f;
  form.removeImage = false;
  const reader = new FileReader();
  reader.onload = (ev: any) => form.newImagePreview = ev.target.result as string;
  reader.readAsDataURL(f);
}
function clearIcon()  { form.newIconFile = null; form.newIconPreview = ""; form.removeIcon  = true; }
function clearImage() { form.newImageFile = null; form.newImagePreview = ""; form.removeImage = true; }

async function uploadSingle(file: File): Promise<number | null> {
  const fd = new FormData(); fd.append("files", file);
  const res = await $fetch<any[]>(`${strapiUrl}/api/upload`, { method: "POST", headers: getAuthHeaders(), body: fd });
  return (Array.isArray(res) ? res[0] : res)?.id ?? null;
}

const imgBase = computed(() => strapiUrl);
function imgUrl(media: any) {
  if (!media) return "";
  const url = media.url ?? media.attributes?.url ?? "";
  return url.startsWith("http") ? url : imgBase.value + url;
}

function showToast(msg: string, ok: boolean) { toast.value = msg; toastOk.value = ok; setTimeout(() => toast.value = "", 4000); }

function normalise(i: any) {
  const d = i.attributes || i;
  return { id: i.id, documentId: i.documentId, ...d, icon: d.icon?.data ? { id: d.icon.data.id, ...(d.icon.data.attributes || d.icon.data) } : (d.icon ?? null), image: d.image?.data ? { id: d.image.data.id, ...(d.image.data.attributes || d.image.data) } : (d.image ?? null), seo: d.seo ?? {} };
}

async function load() {
  loading.value = true;
  try {
    const res = await $fetch<any>(`${strapiUrl}/api/product-categories?sort=displayOrder:asc&pagination[limit]=100&populate[icon]=true&populate[image]=true&populate[seo]=true`, { headers: getAuthHeaders() });
    categories.value = (res?.data ?? []).map(normalise);
  } finally { loading.value = false; }
}
onMounted(load);

function openNew() {
  editingId.value = null; editingDocumentId.value = null; activeTab.value = "basic";
  Object.assign(form, { name: "", slug: "", description: "", displayOrder: 0, isActive: true, seo: { metaTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogType: "website", twitterCard: "summary_large_image", noIndex: false, noFollow: false }, existingIcon: null, newIconFile: null, newIconPreview: "", removeIcon: false, existingImage: null, newImageFile: null, newImagePreview: "", removeImage: false });
  showForm.value = true;
}
function openEdit(c: any) {
  editingId.value = c.id; editingDocumentId.value = c.documentId ?? null; activeTab.value = "basic";
  Object.assign(form, { name: c.name ?? "", slug: c.slug ?? "", description: c.description ?? "", displayOrder: c.displayOrder ?? 0, isActive: c.isActive !== false, seo: Object.assign({ metaTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogType: "website", twitterCard: "summary_large_image", noIndex: false, noFollow: false }, c.seo ?? {}), existingIcon: c.icon ?? null, newIconFile: null, newIconPreview: "", removeIcon: false, existingImage: c.image ?? null, newImageFile: null, newImagePreview: "", removeImage: false });
  showForm.value = true;
}

async function save() {
  if (!form.name.trim() || !form.slug.trim()) { showToast("Name and slug are required", false); return; }
  saving.value = true;
  try {
    const h = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const body: any = { data: { name: form.name, slug: form.slug, description: form.description || null, displayOrder: Number(form.displayOrder), isActive: form.isActive, seo: { metaTitle: form.seo.metaTitle || null, metaDescription: form.seo.metaDescription || null, canonicalUrl: form.seo.canonicalUrl || null, ogTitle: form.seo.ogTitle || null, ogDescription: form.seo.ogDescription || null, ogType: form.seo.ogType, twitterCard: form.seo.twitterCard, noIndex: form.seo.noIndex, noFollow: form.seo.noFollow } } };
    if (form.newIconFile) { const id = await uploadSingle(form.newIconFile); if (id) body.data.icon = id; }
    else if (form.removeIcon) body.data.icon = null;
    if (form.newImageFile) { const id = await uploadSingle(form.newImageFile); if (id) body.data.image = id; }
    else if (form.removeImage) body.data.image = null;
    const url = editingDocumentId.value ? `${strapiUrl}/api/product-categories/${editingDocumentId.value}` : `${strapiUrl}/api/product-categories`;
    await $fetch(url, { method: editingDocumentId.value ? "PUT" : "POST", headers: h, body });
    showToast(editingDocumentId.value ? "Category updated" : "Category created", true);
    showForm.value = false; await load();
  } catch (e: any) { showToast(e?.data?.error?.message || "Save failed", false); }
  finally { saving.value = false; }
}
async function remove(c: any) {
  if (!confirm("Delete this category?")) return;
  const docId = c.documentId ?? c.id;
  try { await $fetch(`${strapiUrl}/api/product-categories/${docId}`, { method: "DELETE", headers: getAuthHeaders() }); showToast("Deleted", true); await load(); }
  catch { showToast("Delete failed", false); }
}

const tabs = [{ key: "basic", label: "Basic" }, { key: "media", label: "Media" }, { key: "seo", label: "SEO" }];
</script>

<template>
  <div class="pa">
    <div v-if="toast" :class="['toast', toastOk ? 'toast--ok' : 'toast--err']">{{ toast }}</div>
    <div class="pa-header">
      <div><h1>Categories</h1><p>{{ categories.length }} categor{{ categories.length !== 1 ? "ies" : "y" }}</p></div>
      <button class="btn-add" @click="openNew">+ Add Category</button>
    </div>

    <div class="table-card">
      <div v-if="loading" class="empty-msg">Loading...</div>
      <table v-else-if="categories.length" class="data-table">
        <thead><tr><th>Icon</th><th>Image</th><th>Name</th><th>Slug</th><th>Order</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="c in categories" :key="c.id">
            <td><img v-if="c.icon" :src="imgUrl(c.icon)" class="icon-thumb" :alt="c.name" /><span v-else class="no-img">-</span></td>
            <td><img v-if="c.image" :src="imgUrl(c.image)" class="thumb" :alt="c.name" /><span v-else class="no-img">-</span></td>
            <td><strong>{{ c.name }}</strong></td>
            <td class="slug-text">{{ c.slug }}</td>
            <td>{{ c.displayOrder }}</td>
            <td><span :class="['badge', c.isActive ? 'badge--green' : 'badge--grey']">{{ c.isActive ? "Active" : "Hidden" }}</span></td>
            <td>
              <button class="btn-icon" @click="openEdit(c)">Edit</button>
              <button class="btn-icon btn-icon--del" @click="remove(c)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-msg">No categories yet.</div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-lg">
        <div class="modal-head">
          <h2>{{ editingId ? "Edit Category" : "New Category" }}</h2>
          <button class="modal-close" @click="showForm = false">X</button>
        </div>
        <div class="tab-bar">
          <button v-for="t in tabs" :key="t.key" :class="['tab-btn', { active: activeTab === t.key }]" @click="activeTab = t.key">{{ t.label }}</button>
        </div>
        <div class="modal-body">

          <!-- BASIC -->
          <div v-show="activeTab === 'basic'" class="tab-pane">
            <div class="field-row">
              <div class="field"><label>Name *</label><input v-model="form.name" @input="autoSlug" class="input" /></div>
              <div class="field"><label>Slug *</label><input v-model="form.slug" class="input" /></div>
            </div>
            <div class="field"><label>Description</label><textarea v-model="form.description" class="input" rows="3"></textarea></div>
            <div class="field-row">
              <div class="field" style="max-width:120px"><label>Display Order</label><input v-model.number="form.displayOrder" type="number" class="input" /></div>
              <div class="field" style="align-self:flex-end;padding-bottom:.5rem">
                <label class="check-label"><input type="checkbox" v-model="form.isActive" /> Active (visible on site)</label>
              </div>
            </div>
          </div>

          <!-- MEDIA -->
          <div v-show="activeTab === 'media'" class="tab-pane">
            <div class="media-section">
              <h3 class="section-title">Icon (small square, shown in nav/menus)</h3>
              <div class="media-preview-row">
                <div v-if="form.newIconPreview" class="media-item">
                  <img :src="form.newIconPreview" class="media-thumb" alt="New icon" />
                  <button class="img-remove" @click="clearIcon">X</button>
                  <span class="img-badge">New</span>
                </div>
                <div v-else-if="form.existingIcon && !form.removeIcon" class="media-item">
                  <img :src="imgUrl(form.existingIcon)" class="media-thumb" alt="Current icon" />
                  <button class="img-remove" @click="clearIcon">X</button>
                </div>
                <div v-else class="media-placeholder">No icon</div>
              </div>
              <label class="upload-btn">
                <input type="file" accept="image/*" @change="onIconChange" style="display:none" />
                {{ form.existingIcon || form.newIconPreview ? "Replace Icon" : "Upload Icon" }}
              </label>
            </div>

            <div class="media-section">
              <h3 class="section-title">Category Image (hero/banner image for category page)</h3>
              <div class="media-preview-row">
                <div v-if="form.newImagePreview" class="media-item media-item--wide">
                  <img :src="form.newImagePreview" class="media-thumb media-thumb--wide" alt="New image" />
                  <button class="img-remove" @click="clearImage">X</button>
                  <span class="img-badge">New</span>
                </div>
                <div v-else-if="form.existingImage && !form.removeImage" class="media-item media-item--wide">
                  <img :src="imgUrl(form.existingImage)" class="media-thumb media-thumb--wide" alt="Current image" />
                  <button class="img-remove" @click="clearImage">X</button>
                </div>
                <div v-else class="media-placeholder">No image</div>
              </div>
              <label class="upload-btn">
                <input type="file" accept="image/*" @change="onImageChange" style="display:none" />
                {{ form.existingImage || form.newImagePreview ? "Replace Image" : "Upload Image" }}
              </label>
            </div>
          </div>

          <!-- SEO -->
          <div v-show="activeTab === 'seo'" class="tab-pane">
            <div class="field-row">
              <div class="field">
                <label>Meta Title (max 70)</label>
                <input v-model="form.seo.metaTitle" class="input" maxlength="70" />
                <span class="hint">{{ form.seo.metaTitle ? form.seo.metaTitle.length : 0 }}/70</span>
              </div>
              <div class="field"><label>Canonical URL</label><input v-model="form.seo.canonicalUrl" class="input" placeholder="https://..." /></div>
            </div>
            <div class="field">
              <label>Meta Description (max 160)</label>
              <textarea v-model="form.seo.metaDescription" class="input" rows="2" maxlength="160"></textarea>
              <span class="hint">{{ form.seo.metaDescription ? form.seo.metaDescription.length : 0 }}/160</span>
            </div>
            <div class="field-row">
              <div class="field"><label>OG Title</label><input v-model="form.seo.ogTitle" class="input" maxlength="70" /></div>
              <div class="field"><label>OG Type</label>
                <select v-model="form.seo.ogType" class="input"><option value="website">website</option><option value="article">article</option><option value="product">product</option></select>
              </div>
              <div class="field"><label>Twitter Card</label>
                <select v-model="form.seo.twitterCard" class="input"><option value="summary">summary</option><option value="summary_large_image">summary_large_image</option></select>
              </div>
            </div>
            <div class="field"><label>OG Description</label><textarea v-model="form.seo.ogDescription" class="input" rows="2"></textarea></div>
            <div class="check-row">
              <label class="check-label"><input type="checkbox" v-model="form.seo.noIndex" /> noindex</label>
              <label class="check-label"><input type="checkbox" v-model="form.seo.noFollow" /> nofollow</label>
            </div>
          </div>

        </div>
        <div class="modal-foot">
          <button class="btn-cancel" @click="showForm = false">Cancel</button>
          <button class="btn-save" :disabled="saving" @click="save">{{ saving ? "Saving..." : editingId ? "Save Changes" : "Create Category" }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pa { padding: 0; }
.pa-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;
  h1 { font-size: 1.75rem; font-weight: 700; margin: 0; }
  p  { color: #64748b; margin: .25rem 0 0; font-size: .9rem; }
}
.btn-add { background: #3b82f6; color: white; border: none; padding: .6rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; &:hover { background: #2563eb; } }
.table-card { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: auto; }
.data-table { width: 100%; border-collapse: collapse;
  th, td { padding: .75rem 1rem; text-align: left; white-space: nowrap; }
  th { font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  td { border-bottom: 1px solid #f1f5f9; font-size: .9rem; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
}
.icon-thumb { width: 32px; height: 32px; object-fit: contain; border-radius: 4px; }
.thumb { width: 60px; height: 40px; object-fit: cover; border-radius: 6px; }
.no-img { color: #94a3b8; }
.slug-text { color: #64748b; font-size: .85rem; }
.badge { font-size: .75rem; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
.badge--green { background: #dcfce7; color: #15803d; }
.badge--grey  { background: #f1f5f9; color: #64748b; }
.btn-icon { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: .25rem .6rem; cursor: pointer; font-size: .8rem; margin-right: .25rem; &:hover { background: #e2e8f0; } }
.btn-icon--del:hover { background: #fee2e2; border-color: #fca5a5; }
.empty-msg { padding: 3rem; text-align: center; color: #94a3b8; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 200; display: flex; align-items: flex-start; justify-content: center; padding: 2rem 1rem; overflow-y: auto; }
.modal-lg { background: white; border-radius: 16px; width: 100%; max-width: 720px; box-shadow: 0 20px 60px rgba(0,0,0,.25); display: flex; flex-direction: column; margin: auto; }
.modal-head { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0;
  h2 { margin: 0; font-size: 1.25rem; }
}
.modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: .25rem .5rem; border-radius: 4px; color: #64748b; &:hover { background: #f1f5f9; } }
.tab-bar { display: flex; border-bottom: 1px solid #e2e8f0; padding: 0 1.5rem; flex-shrink: 0; }
.tab-btn { background: none; border: none; border-bottom: 2px solid transparent; padding: .75rem 1rem; font-size: .85rem; font-weight: 500; cursor: pointer; color: #64748b;
  &.active { color: #3b82f6; border-bottom-color: #3b82f6; }
  &:hover:not(.active) { color: #1e293b; }
}
.modal-body { padding: 1.5rem; overflow-y: auto; max-height: calc(100vh - 240px); }
.tab-pane { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 0;
  label { font-size: .8rem; font-weight: 600; color: #374151; }
}
.input { padding: .55rem .75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: .9rem; width: 100%; box-sizing: border-box;
  &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
}
textarea.input { resize: vertical; }
.hint { font-size: .75rem; color: #9ca3af; }
.field-row { display: flex; gap: 1rem; flex-wrap: wrap; & > .field { min-width: 130px; } }
.check-row { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.check-label { display: flex; align-items: center; gap: .4rem; font-size: .85rem; cursor: pointer; }
.media-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; }
.section-title { margin: 0 0 .75rem; font-size: .9rem; font-weight: 600; }
.media-preview-row { display: flex; gap: .75rem; flex-wrap: wrap; margin-bottom: .75rem; }
.media-item { position: relative; width: 80px; height: 80px;
  img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
}
.media-item--wide { width: 160px; height: 90px; }
.media-thumb { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
.media-thumb--wide { object-fit: cover; }
.media-placeholder { width: 80px; height: 80px; border: 2px dashed #d1d5db; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: .75rem; }
.img-remove { position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: .65rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.img-badge { position: absolute; bottom: 2px; left: 2px; background: #22c55e; color: white; font-size: .6rem; padding: 1px 4px; border-radius: 3px; }
.upload-btn { display: inline-block; background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: .5rem 1rem; font-size: .85rem; cursor: pointer; &:hover { border-color: #3b82f6; color: #3b82f6; } }
.modal-foot { display: flex; justify-content: flex-end; gap: .75rem; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; flex-shrink: 0; }
.btn-cancel { background: #f1f5f9; border: none; padding: .6rem 1.25rem; border-radius: 8px; cursor: pointer; &:hover { background: #e2e8f0; } }
.btn-save { background: #3b82f6; color: white; border: none; padding: .6rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;
  &:hover:not(:disabled) { background: #2563eb; }
  &:disabled { opacity: .6; cursor: not-allowed; }
}
.toast { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 300; padding: .75rem 1.25rem; border-radius: 10px; font-weight: 500; font-size: .9rem; box-shadow: 0 4px 16px rgba(0,0,0,.15); }
.toast--ok  { background: #dcfce7; color: #166534; }
.toast--err { background: #fee2e2; color: #991b1b; }
</style>
