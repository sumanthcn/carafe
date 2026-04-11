<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

const config = useRuntimeConfig();
const { getAuthHeaders } = useAuth();
const strapiUrl = config.public.strapiUrl;

const products   = ref<any[]>([]);
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
  name: "", slug: "", subtitle: "", description: "", shortDescription: "",
  currency: "GBP", isTopSeller: false, isLimitedEdition: false, isWhatsNew: false,
  displayOrder: 0, category: null,
  variants: [],
  attributes: { tastingNotes: "", origin: "", region: "", varietal: "", process: "", altitude: "", bestServed: "" },
  subscriptionOptions: [],
  relatedProducts: [],
  seo: { metaTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogType: "product", twitterCard: "summary_large_image", noIndex: false, noFollow: false },
  existingImages: [], newImages: [], newImagePreviews: [], removedImageIds: [],
});

function addVariant() { form.variants.push({ weight: "250g", grindSize: "Whole Bean", roastLevel: "Medium", price: 0, salePrice: null, sku: "", stockQuantity: 0, inStock: true }); }
function removeVariant(i: number) { form.variants.splice(i, 1); }
function addSubscription() { form.subscriptionOptions.push({ deliveryInterval: "2_weeks", discountPercentage: 10 }); }
function removeSubscription(i: number) { form.subscriptionOptions.splice(i, 1); }

function onFileChange(e: Event) {
  Array.from((e.target as HTMLInputElement).files ?? []).forEach(f => {
    form.newImages.push(f);
    const reader = new FileReader();
    reader.onload = (ev: any) => form.newImagePreviews.push(ev.target.result as string);
    reader.readAsDataURL(f);
  });
}
function removeNewImage(i: number) { form.newImages.splice(i, 1); form.newImagePreviews.splice(i, 1); }
function markRemoveExisting(img: any) { form.removedImageIds.push(img.id); form.existingImages = form.existingImages.filter((x: any) => x.id !== img.id); }

async function uploadImages(files: File[]): Promise<number[]> {
  if (!files.length) return [];
  const fd = new FormData();
  files.forEach(f => fd.append("files", f));
  const res = await $fetch<any[]>(`${strapiUrl}/api/upload`, { method: "POST", headers: getAuthHeaders(), body: fd });
  return (Array.isArray(res) ? res : [res]).map((r: any) => r.id);
}

function toggleRelated(id: number) {
  const idx = form.relatedProducts.indexOf(id);
  if (idx === -1) form.relatedProducts.push(id); else form.relatedProducts.splice(idx, 1);
}
function autoSlug() { if (!editingId.value) form.slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }
function showToast(msg: string, ok: boolean) { toast.value = msg; toastOk.value = ok; setTimeout(() => toast.value = "", 4000); }
const imgBase = computed(() => strapiUrl);

function normalise(i: any) {
  const d = i.attributes || i;
  return {
    id: i.id, documentId: i.documentId, ...d,
    category: d.category?.data ? { id: d.category.data.id, ...(d.category.data.attributes || d.category.data) } : d.category ?? null,
    images: (d.images?.data ?? d.images ?? []).map((img: any) => img.attributes ? { id: img.id, ...img.attributes } : img),
    variants: d.variants ?? [],
    attributes: d.attributes ?? {},
    subscriptionOptions: d.subscriptionOptions ?? [],
    relatedProducts: (d.relatedProducts?.data ?? d.relatedProducts ?? []).map((r: any) => r.id ?? r),
    seo: d.seo ?? {},
  };
}

async function load() {
  loading.value = true;
  try {
    const h = getAuthHeaders();
    const [prodRes, catRes] = await Promise.all([
      $fetch<any>(`${strapiUrl}/api/products?populate[category]=true&populate[images]=true&populate[variants]=true&populate[attributes]=true&populate[subscriptionOptions]=true&populate[relatedProducts][fields][0]=id&populate[relatedProducts][fields][1]=name&populate[seo]=true&sort=displayOrder:asc&pagination[limit]=200`, { headers: h }),
      $fetch<any>(`${strapiUrl}/api/product-categories?sort=name:asc&pagination[limit]=100`, { headers: h }),
    ]);
    products.value   = (prodRes?.data ?? []).map(normalise);
    categories.value = (catRes?.data ?? []).map((i: any) => i.attributes ? { id: i.id, ...i.attributes } : { ...i });
  } finally { loading.value = false; }
}
onMounted(load);

function resetForm() {
  Object.assign(form, { name: "", slug: "", subtitle: "", description: "", shortDescription: "", currency: "GBP", isTopSeller: false, isLimitedEdition: false, isWhatsNew: false, displayOrder: 0, category: null, variants: [], subscriptionOptions: [], relatedProducts: [], attributes: { tastingNotes: "", origin: "", region: "", varietal: "", process: "", altitude: "", bestServed: "" }, seo: { metaTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogType: "product", twitterCard: "summary_large_image", noIndex: false, noFollow: false }, existingImages: [], newImages: [], newImagePreviews: [], removedImageIds: [] });
}
function openNew() { editingId.value = null; editingDocumentId.value = null; activeTab.value = "basic"; resetForm(); showForm.value = true; }
function openEdit(p: any) {
  editingId.value = p.id; editingDocumentId.value = p.documentId ?? null; activeTab.value = "basic";
  Object.assign(form, { name: p.name ?? "", slug: p.slug ?? "", subtitle: p.subtitle ?? "", description: p.description ?? "", shortDescription: p.shortDescription ?? "", currency: p.currency ?? "GBP", isTopSeller: !!p.isTopSeller, isLimitedEdition: !!p.isLimitedEdition, isWhatsNew: !!p.isWhatsNew, displayOrder: p.displayOrder ?? 0, category: p.category?.id ?? null, variants: JSON.parse(JSON.stringify(p.variants ?? [])), subscriptionOptions: JSON.parse(JSON.stringify(p.subscriptionOptions ?? [])), relatedProducts: (p.relatedProducts ?? []).map((r: any) => r.id ?? r), attributes: Object.assign({ tastingNotes: "", origin: "", region: "", varietal: "", process: "", altitude: "", bestServed: "" }, p.attributes ?? {}), seo: Object.assign({ metaTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogType: "product", twitterCard: "summary_large_image", noIndex: false, noFollow: false }, p.seo ?? {}), existingImages: JSON.parse(JSON.stringify(p.images ?? [])), newImages: [], newImagePreviews: [], removedImageIds: [] });
  showForm.value = true;
}

async function save() {
  if (!form.name.trim() || !form.slug.trim()) { showToast("Name and slug are required", false); return; }
  saving.value = true;
  try {
    const h = getAuthHeaders();
    const newImageIds = await uploadImages(form.newImages);
    const keepIds = form.existingImages.filter((img: any) => !form.removedImageIds.includes(img.id)).map((img: any) => img.id);
    const allImageIds = [...keepIds, ...newImageIds];
    const body: any = { data: { name: form.name, slug: form.slug, subtitle: form.subtitle || null, description: form.description || null, shortDescription: form.shortDescription || null, currency: form.currency, isTopSeller: form.isTopSeller, isLimitedEdition: form.isLimitedEdition, isWhatsNew: form.isWhatsNew, displayOrder: Number(form.displayOrder), category: form.category ? { connect: [form.category] } : { disconnect: [] }, variants: form.variants.map((v: any) => ({ weight: v.weight, grindSize: v.grindSize || null, roastLevel: v.roastLevel || null, price: Number(v.price), salePrice: v.salePrice ? Number(v.salePrice) : null, sku: v.sku, stockQuantity: Number(v.stockQuantity), inStock: v.inStock })), attributes: { tastingNotes: form.attributes.tastingNotes || null, origin: form.attributes.origin || null, region: form.attributes.region || null, varietal: form.attributes.varietal || null, process: form.attributes.process || null, altitude: form.attributes.altitude || null, bestServed: form.attributes.bestServed || null }, subscriptionOptions: form.subscriptionOptions.map((s: any) => ({ deliveryInterval: s.deliveryInterval, discountPercentage: Number(s.discountPercentage) })), relatedProducts: { set: form.relatedProducts }, seo: { metaTitle: form.seo.metaTitle || null, metaDescription: form.seo.metaDescription || null, canonicalUrl: form.seo.canonicalUrl || null, ogTitle: form.seo.ogTitle || null, ogDescription: form.seo.ogDescription || null, ogType: form.seo.ogType, twitterCard: form.seo.twitterCard, noIndex: form.seo.noIndex, noFollow: form.seo.noFollow } } };
    if (allImageIds.length) body.data.images = { set: allImageIds };
    const url = editingDocumentId.value ? `${strapiUrl}/api/products/${editingDocumentId.value}` : `${strapiUrl}/api/products`;
    await $fetch(url, { method: editingDocumentId.value ? "PUT" : "POST", headers: { ...h, "Content-Type": "application/json" }, body });
    showToast(editingDocumentId.value ? "Product updated" : "Product created", true);
    showForm.value = false; await load();
  } catch (e: any) { showToast(e?.data?.error?.message || "Save failed", false); }
  finally { saving.value = false; }
}
async function remove(p: any) {
  if (!confirm("Delete this product?")) return;
  const docId = p.documentId ?? p.id;
  try { await $fetch(`${strapiUrl}/api/products/${docId}`, { method: "DELETE", headers: getAuthHeaders() }); showToast("Deleted", true); await load(); }
  catch { showToast("Delete failed", false); }
}

const tabs = [
  { key: "basic", label: "Basic" }, { key: "variants", label: "Variants" },
  { key: "attributes", label: "Coffee Info" }, { key: "subscriptions", label: "Subscriptions" },
  { key: "images", label: "Images" }, { key: "seo", label: "SEO" }, { key: "relations", label: "Related" },
];
</script>

<template>
  <div class="pa">
    <div v-if="toast" :class="['toast', toastOk ? 'toast--ok' : 'toast--err']">{{ toast }}</div>
    <div class="pa-header">
      <div><h1>Products</h1><p>{{ products.length }} product{{ products.length !== 1 ? "s" : "" }}</p></div>
      <button class="btn-add" @click="openNew">+ Add Product</button>
    </div>
    <div class="table-card">
      <div v-if="loading" class="empty-msg">Loading...</div>
      <table v-else-if="products.length" class="data-table">
        <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Variants</th><th>Tags</th><th>Order</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>
              <img v-if="p.images && p.images[0]" :src="p.images[0].url && p.images[0].url.startsWith('http') ? p.images[0].url : imgBase + p.images[0].url" class="thumb" :alt="p.name" />
              <span v-else class="no-img">-</span>
            </td>
            <td><strong>{{ p.name }}</strong><div class="slug-text">{{ p.slug }}</div></td>
            <td>{{ p.category ? p.category.name : "-" }}</td>
            <td>{{ p.variants ? p.variants.length : 0 }}</td>
            <td>
              <span v-if="p.isTopSeller" class="badge badge--blue">Top</span>
              <span v-if="p.isLimitedEdition" class="badge badge--orange">Ltd</span>
              <span v-if="p.isWhatsNew" class="badge badge--green">New</span>
            </td>
            <td>{{ p.displayOrder }}</td>
            <td>
              <button class="btn-icon" @click="openEdit(p)">Edit</button>
              <button class="btn-icon btn-icon--del" @click="remove(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-msg">No products yet.</div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-lg">
        <div class="modal-head">
          <h2>{{ editingId ? "Edit Product" : "New Product" }}</h2>
          <button class="modal-close" @click="showForm = false">X</button>
        </div>
        <div class="tab-bar">
          <button v-for="t in tabs" :key="t.key" :class="['tab-btn', { active: activeTab === t.key }]" @click="activeTab = t.key">{{ t.label }}</button>
        </div>
        <div class="modal-body">

          <!-- BASIC -->
          <div v-show="activeTab === 'basic'" class="tab-pane">
            <div class="field-row">
              <div class="field"><label>Name *</label><input v-model="form.name" @input="autoSlug" class="input" placeholder="Ethiopia - Beshasha" /></div>
              <div class="field"><label>Slug *</label><input v-model="form.slug" class="input" /></div>
            </div>
            <div class="field"><label>Subtitle</label><input v-model="form.subtitle" class="input" placeholder="Washed - Heirloom" /></div>
            <div class="field">
              <label>Short Description (max 300)</label>
              <textarea v-model="form.shortDescription" class="input" rows="2" maxlength="300"></textarea>
              <span class="hint">{{ form.shortDescription ? form.shortDescription.length : 0 }}/300</span>
            </div>
            <div class="field"><label>Full Description</label><textarea v-model="form.description" class="input" rows="5"></textarea></div>
            <div class="field-row">
              <div class="field">
                <label>Category</label>
                <select v-model="form.category" class="input">
                  <option :value="null">- None -</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="field">
                <label>Currency</label>
                <select v-model="form.currency" class="input">
                  <option value="GBP">GBP</option><option value="EUR">EUR</option><option value="USD">USD</option>
                </select>
              </div>
              <div class="field" style="max-width:110px"><label>Display Order</label><input v-model.number="form.displayOrder" type="number" class="input" /></div>
            </div>
            <div class="check-row">
              <label class="check-label"><input type="checkbox" v-model="form.isTopSeller" /> Top Seller</label>
              <label class="check-label"><input type="checkbox" v-model="form.isLimitedEdition" /> Limited Edition</label>
              <label class="check-label"><input type="checkbox" v-model="form.isWhatsNew" /> What's New</label>
            </div>
          </div>

          <!-- VARIANTS -->
          <div v-show="activeTab === 'variants'" class="tab-pane">
            <p class="hint-top">Each variant is a purchasable unit (weight x grind) with its own price and stock.</p>
            <div v-for="(v, i) in form.variants" :key="i" class="component-block">
              <div class="component-head"><strong>Variant {{ i + 1 }}</strong><button class="btn-remove" @click="removeVariant(i)">Remove</button></div>
              <div class="field-row">
                <div class="field"><label>Weight *</label>
                  <select v-model="v.weight" class="input"><option v-for="w in ['250g','500g','1kg','2kg']" :key="w" :value="w">{{ w }}</option></select>
                </div>
                <div class="field"><label>Grind Size</label>
                  <select v-model="v.grindSize" class="input">
                    <option value="">- Any -</option>
                    <option v-for="g in ['Espresso','Filter','Whole Bean','Moka Pot','Aeropress','V60','Chemex','Cafetiere']" :key="g" :value="g">{{ g }}</option>
                  </select>
                </div>
                <div class="field"><label>Roast Level</label>
                  <select v-model="v.roastLevel" class="input">
                    <option value="">- Any -</option>
                    <option v-for="r in ['Light','Medium-Light','Medium']" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
              </div>
              <div class="field-row">
                <div class="field"><label>Price (GBP) *</label><input v-model.number="v.price" type="number" step="0.01" min="0" class="input" /></div>
                <div class="field"><label>Sale Price</label><input v-model="v.salePrice" type="number" step="0.01" class="input" placeholder="Optional" /></div>
                <div class="field"><label>SKU *</label><input v-model="v.sku" class="input" placeholder="ETH-250-WB" /></div>
                <div class="field"><label>Stock Qty</label><input v-model.number="v.stockQuantity" type="number" min="0" class="input" /></div>
              </div>
              <label class="check-label"><input type="checkbox" v-model="v.inStock" /> In Stock</label>
            </div>
            <button class="btn-secondary" @click="addVariant">+ Add Variant</button>
          </div>

          <!-- COFFEE INFO -->
          <div v-show="activeTab === 'attributes'" class="tab-pane">
            <p class="hint-top">Origin and tasting characteristics shown on the product page.</p>
            <div class="field-row">
              <div class="field"><label>Origin</label><input v-model="form.attributes.origin" class="input" placeholder="Ethiopia" /></div>
              <div class="field"><label>Region</label><input v-model="form.attributes.region" class="input" placeholder="Yirgacheffe" /></div>
            </div>
            <div class="field-row">
              <div class="field"><label>Varietal</label><input v-model="form.attributes.varietal" class="input" placeholder="Heirloom" /></div>
              <div class="field"><label>Process</label><input v-model="form.attributes.process" class="input" placeholder="Washed" /></div>
              <div class="field"><label>Altitude</label><input v-model="form.attributes.altitude" class="input" placeholder="1800-2200m" /></div>
            </div>
            <div class="field"><label>Tasting Notes</label><textarea v-model="form.attributes.tastingNotes" class="input" rows="2" placeholder="Tangerine, jasmine, honey..."></textarea></div>
            <div class="field"><label>Best Served</label><textarea v-model="form.attributes.bestServed" class="input" rows="2" placeholder="Pour-over, Aeropress..."></textarea></div>
          </div>

          <!-- SUBSCRIPTIONS -->
          <div v-show="activeTab === 'subscriptions'" class="tab-pane">
            <p class="hint-top">Subscription delivery intervals and discounts available for this product.</p>
            <div v-for="(s, i) in form.subscriptionOptions" :key="i" class="component-block">
              <div class="component-head"><strong>Option {{ i + 1 }}</strong><button class="btn-remove" @click="removeSubscription(i)">Remove</button></div>
              <div class="field-row">
                <div class="field"><label>Interval *</label>
                  <select v-model="s.deliveryInterval" class="input">
                    <option value="1_week">Every week</option>
                    <option value="2_weeks">Every 2 weeks</option>
                    <option value="3_weeks">Every 3 weeks</option>
                    <option value="1_month">Every month</option>
                    <option value="2_months">Every 2 months</option>
                  </select>
                </div>
                <div class="field"><label>Discount %</label><input v-model.number="s.discountPercentage" type="number" min="0" max="100" step="0.5" class="input" /></div>
              </div>
            </div>
            <button class="btn-secondary" @click="addSubscription">+ Add Option</button>
          </div>

          <!-- IMAGES -->
          <div v-show="activeTab === 'images'" class="tab-pane">
            <p class="hint-top">Upload product images. First image is the main/thumbnail image.</p>
            <div v-if="form.existingImages.length || form.newImagePreviews.length" class="img-grid">
              <div v-for="img in form.existingImages" :key="img.id" class="img-item">
                <img :src="img.url && img.url.startsWith('http') ? img.url : imgBase + img.url" :alt="img.name" />
                <button class="img-remove" @click="markRemoveExisting(img)">X</button>
              </div>
              <div v-for="(src, i) in form.newImagePreviews" :key="'new-' + i" class="img-item img-item--new">
                <img :src="src" alt="New" />
                <button class="img-remove" @click="removeNewImage(i)">X</button>
                <span class="img-badge">New</span>
              </div>
            </div>
            <label class="upload-btn">
              <input type="file" accept="image/*" multiple @change="onFileChange" style="display:none" />
              Choose Images
            </label>
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

          <!-- RELATED PRODUCTS -->
          <div v-show="activeTab === 'relations'" class="tab-pane">
            <p class="hint-top">Select products to show as "You may also like". Click to toggle selection.</p>
            <div class="related-grid">
              <div v-for="p in products.filter(p => p.id !== editingId)" :key="p.id"
                :class="['related-item', { selected: form.relatedProducts.includes(p.id) }]"
                @click="toggleRelated(p.id)">
                <img v-if="p.images && p.images[0]"
                  :src="p.images[0].url && p.images[0].url.startsWith('http') ? p.images[0].url : imgBase + p.images[0].url"
                  class="related-thumb" />
                <span v-else class="related-thumb related-thumb--none">*</span>
                <span class="related-name">{{ p.name }}</span>
                <span v-if="form.relatedProducts.includes(p.id)" class="related-check">check</span>
              </div>
            </div>
          </div>

        </div>
        <div class="modal-foot">
          <button class="btn-cancel" @click="showForm = false">Cancel</button>
          <button class="btn-save" :disabled="saving" @click="save">{{ saving ? "Saving..." : editingId ? "Save Changes" : "Create Product" }}</button>
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
.btn-add { background: #3b82f6; color: white; border: none; padding: .6rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer;
  &:hover { background: #2563eb; }
}
.table-card { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: auto; }
.data-table { width: 100%; border-collapse: collapse;
  th, td { padding: .75rem 1rem; text-align: left; white-space: nowrap; }
  th { font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  td { border-bottom: 1px solid #f1f5f9; font-size: .9rem; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
}
.thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
.no-img { color: #94a3b8; }
.slug-text { color: #94a3b8; font-size: .75rem; }
.badge { font-size: .7rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-right: 3px; }
.badge--blue   { background: #dbeafe; color: #1d4ed8; }
.badge--orange { background: #ffedd5; color: #c2410c; }
.badge--green  { background: #dcfce7; color: #15803d; }
.btn-icon { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: .25rem .6rem; cursor: pointer; font-size: .8rem; margin-right: .25rem;
  &:hover { background: #e2e8f0; }
}
.btn-icon--del:hover { background: #fee2e2; border-color: #fca5a5; }
.empty-msg { padding: 3rem; text-align: center; color: #94a3b8; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 200; display: flex; align-items: flex-start; justify-content: center; padding: 2rem 1rem; overflow-y: auto; }
.modal-lg { background: white; border-radius: 16px; width: 100%; max-width: 860px; box-shadow: 0 20px 60px rgba(0,0,0,.25); display: flex; flex-direction: column; margin: auto; }
.modal-head { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0;
  h2 { margin: 0; font-size: 1.25rem; }
}
.modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: .25rem .5rem; border-radius: 4px; color: #64748b;
  &:hover { background: #f1f5f9; color: #1e293b; }
}
.tab-bar { display: flex; border-bottom: 1px solid #e2e8f0; padding: 0 1.5rem; overflow-x: auto; flex-shrink: 0; }
.tab-btn { background: none; border: none; border-bottom: 2px solid transparent; padding: .75rem 1rem; font-size: .85rem; font-weight: 500; cursor: pointer; color: #64748b; white-space: nowrap;
  &.active { color: #3b82f6; border-bottom-color: #3b82f6; }
  &:hover:not(.active) { color: #1e293b; }
}
.modal-body { padding: 1.5rem; overflow-y: auto; max-height: calc(100vh - 260px); }
.tab-pane { display: flex; flex-direction: column; gap: 1rem; }
.hint-top { margin: 0 0 .25rem; color: #64748b; font-size: .85rem; }
.field { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 0;
  label { font-size: .8rem; font-weight: 600; color: #374151; }
}
.input { padding: .55rem .75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: .9rem; width: 100%; box-sizing: border-box;
  &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
}
textarea.input { resize: vertical; }
.hint { font-size: .75rem; color: #9ca3af; }
.field-row { display: flex; gap: 1rem; flex-wrap: wrap;
  & > .field { min-width: 130px; }
}
.check-row { display: flex; gap: 1.5rem; flex-wrap: wrap; padding-top: .25rem; }
.check-label { display: flex; align-items: center; gap: .4rem; font-size: .85rem; cursor: pointer; }
.component-block { border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; background: #f8fafc; }
.component-head  { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
.btn-remove { background: #fee2e2; border: none; color: #dc2626; border-radius: 6px; padding: 3px 10px; font-size: .8rem; cursor: pointer;
  &:hover { background: #fecaca; }
}
.btn-secondary { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: .5rem 1rem; font-size: .85rem; cursor: pointer; width: fit-content;
  &:hover { background: #e2e8f0; }
}
.img-grid { display: flex; flex-wrap: wrap; gap: .75rem; margin-bottom: .75rem; }
.img-item { position: relative; width: 100px; height: 100px;
  img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
}
.img-item--new img { border-color: #86efac; }
.img-remove { position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: .65rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.img-badge { position: absolute; bottom: 2px; left: 2px; background: #22c55e; color: white; font-size: .6rem; padding: 1px 4px; border-radius: 3px; }
.upload-btn { display: inline-block; background: #f1f5f9; border: 1px dashed #94a3b8; border-radius: 8px; padding: .6rem 1.25rem; font-size: .85rem; cursor: pointer;
  &:hover { background: #e2e8f0; border-color: #3b82f6; }
}
.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .75rem; }
.related-item { border: 2px solid #e2e8f0; border-radius: 10px; padding: .5rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: .35rem; transition: border-color .15s; position: relative;
  &.selected { border-color: #3b82f6; background: #eff6ff; }
  &:hover:not(.selected) { border-color: #94a3b8; }
}
.related-thumb { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; }
.related-thumb--none { display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: #f1f5f9; border-radius: 6px; }
.related-name  { font-size: .75rem; text-align: center; color: #374151; word-break: break-word; }
.related-check { position: absolute; top: 4px; right: 4px; background: #3b82f6; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: .6rem; }
.modal-foot { display: flex; justify-content: flex-end; gap: .75rem; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; flex-shrink: 0; }
.btn-cancel { background: #f1f5f9; border: none; padding: .6rem 1.25rem; border-radius: 8px; cursor: pointer; &:hover { background: #e2e8f0; } }
.btn-save   { background: #3b82f6; color: white; border: none; padding: .6rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;
  &:hover:not(:disabled) { background: #2563eb; }
  &:disabled { opacity: .6; cursor: not-allowed; }
}
.toast { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 300; padding: .75rem 1.25rem; border-radius: 10px; font-weight: 500; font-size: .9rem; box-shadow: 0 4px 16px rgba(0,0,0,.15); }
.toast--ok  { background: #dcfce7; color: #166534; }
.toast--err { background: #fee2e2; color: #991b1b; }
</style>
