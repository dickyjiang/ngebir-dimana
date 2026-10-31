<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

// ── Types ──────────────────────────────────────────────────────────────────
interface Cafe {
  id: number
  name: string
  city: string
  rating: number | null
  reviews: number | null
  google_place_id: string | null
  description: string | null
  working_hours: string | null
  source: string
}

// ── Data ───────────────────────────────────────────────────────────────────
const cafes = ref<Cafe[]>([])
const loading = ref(false)

async function loadCafes() {
  loading.value = true
  try {
    const data = await $fetch<Cafe[]>('/api/admin/pending-cafes')
    cafes.value = data ?? []
  } catch (err) {
    console.error('[admin/review] loadCafes error:', err)
    cafes.value = []
  } finally {
    loading.value = false
  }
}

// ── Stats ──────────────────────────────────────────────────────────────────
const total = computed(() => cafes.value.length)

const byCity = computed(() => {
  const counts: Record<string, number> = {}
  for (const c of cafes.value) {
    counts[c.city] = (counts[c.city] ?? 0) + 1
  }
  return counts
})

// ── Single actions ─────────────────────────────────────────────────────────
async function publish(cafe: Cafe) {
  cafes.value = cafes.value.filter((c) => c.id !== cafe.id)
  await $fetch('/api/admin/pending-cafes', { method: 'PATCH', body: { ids: [cafe.id], action: 'publish' } })
}

async function reject(cafe: Cafe) {
  cafes.value = cafes.value.filter((c) => c.id !== cafe.id)
  await $fetch('/api/admin/pending-cafes', { method: 'PATCH', body: { ids: [cafe.id], action: 'reject' } })
}

// ── Bulk actions ───────────────────────────────────────────────────────────
const bulkConfirm = ref<null | 'publish' | 'reject'>(null)

async function bulkPublish() {
  const ids = cafes.value.map((c) => c.id)
  cafes.value = []
  bulkConfirm.value = null
  await $fetch('/api/admin/pending-cafes', { method: 'PATCH', body: { ids, action: 'publish' } })
}

async function bulkReject() {
  const ids = cafes.value.map((c) => c.id)
  cafes.value = []
  bulkConfirm.value = null
  await $fetch('/api/admin/pending-cafes', { method: 'PATCH', body: { ids, action: 'reject' } })
}

// ── Discovery trigger ──────────────────────────────────────────────────────
const discovering = ref(false)
const discoveryResult = ref<string | null>(null)

async function runDiscovery() {
  discovering.value = true
  discoveryResult.value = null
  try {
    const json = await $fetch<{ inserted_count: number }>('/api/admin/run-discovery', {
      method: 'POST',
    })
    if (json.inserted_count > 0) {
      discoveryResult.value = `${json.inserted_count} cafe baru ditemukan`
      await loadCafes()
    } else {
      discoveryResult.value = 'Tidak ada cafe baru'
    }
  } catch (err) {
    discoveryResult.value = 'Error saat menjalankan discovery'
    console.error(err)
  } finally {
    discovering.value = false
  }
}

// ── Manual add ─────────────────────────────────────────────────────────────
type AddStatus = 'new' | 'duplicate' | 'not_found' | 'not_bandung' | 'error'

interface AddCandidate {
  query: string
  status: AddStatus
  reason?: string
  placeId: string
  name: string
  address: string
  rating: number | null
  reviews: number | null
}

const addInput = ref('')
const addCandidates = ref<AddCandidate[]>([])
const addSelected = ref<Set<string>>(new Set())
const addSearching = ref(false)
const addCommitting = ref(false)
const addProgress = ref('')

const statusLabel: Record<AddStatus, string> = {
  new: 'Baru',
  duplicate: 'Duplikat',
  not_found: 'Tidak ditemukan',
  not_bandung: 'Bukan di Bandung',
  error: 'Error',
}

async function previewBars() {
  const queries = addInput.value
    .split('\n')
    .map((q) => q.trim())
    .filter(Boolean)
  if (!queries.length) return
  if (queries.length > 15) {
    showToast('Maksimal 15 bar sekali cari', 'error')
    return
  }

  addSearching.value = true
  try {
    const { results } = await $fetch<{ results: AddCandidate[] }>('/api/admin/add-bars', {
      method: 'POST',
      body: { action: 'preview', queries },
    })
    addCandidates.value = results
    addSelected.value = new Set(results.filter((r) => r.status === 'new').map((r) => r.placeId))
  } catch (err) {
    console.error('[admin/review] previewBars error:', err)
    showToast('Gagal mencari bar', 'error')
  } finally {
    addSearching.value = false
  }
}

function toggleSelected(placeId: string) {
  const next = new Set(addSelected.value)
  if (next.has(placeId)) next.delete(placeId)
  else next.add(placeId)
  addSelected.value = next
}

async function commitBars() {
  const targets = addCandidates.value.filter((c) => addSelected.value.has(c.placeId))
  if (!targets.length) return

  addCommitting.value = true
  let added = 0
  const failed: AddCandidate[] = []

  for (let i = 0; i < targets.length; i++) {
    addProgress.value = `Menambahkan ${i + 1}/${targets.length}: ${targets[i].name}`
    try {
      await $fetch('/api/admin/add-bars', {
        method: 'POST',
        body: { action: 'commit', placeId: targets[i].placeId },
      })
      added++
    } catch (err) {
      console.error('[admin/review] commitBars error:', err)
      failed.push(targets[i])
    }
  }

  addProgress.value = ''
  addCommitting.value = false
  addCandidates.value = failed.map((f) => ({ ...f, status: 'error' as AddStatus, reason: 'Gagal ditambahkan' }))
  addSelected.value = new Set()
  if (!failed.length) addInput.value = ''
  showToast(
    failed.length ? `${added} bar ditambahkan, ${failed.length} gagal` : `${added} bar ditambahkan dan tayang`,
    failed.length ? 'error' : 'success'
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────
const toast = ref<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 4000)
}

// ── Mount ──────────────────────────────────────────────────────────────────
onMounted(() => {
  loadCafes()
})
</script>

<template>
  <!-- Toast -->
  <Transition name="toast-fade">
    <div
      v-if="toast"
      :class="[
        'fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg w-80',
        toast.type === 'error'
          ? 'bg-red-100 text-red-800 border-l-4 border-red-500'
          : toast.type === 'success'
            ? 'bg-green-100 text-green-800 border-l-4 border-green-500'
            : 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
      ]">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">{{ toast.message }}</p>
        <button @click="toast = null" class="ml-4 text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </Transition>

  <!-- Bulk confirm modal -->
  <div
    v-if="bulkConfirm"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-2">
        {{ bulkConfirm === 'publish' ? 'Publish semua?' : 'Hapus semua?' }}
      </h3>
      <p class="text-sm text-gray-600 mb-6">
        {{
          bulkConfirm === 'publish'
            ? `${total} cafe akan dipublish sekaligus.`
            : `${total} cafe akan dihapus permanen.`
        }}
      </p>
      <div class="flex justify-end gap-3">
        <button
          @click="bulkConfirm = null"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Batal
        </button>
        <button
          v-if="bulkConfirm === 'publish'"
          @click="bulkPublish"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
          Ya, Publish Semua
        </button>
        <button
          v-else
          @click="bulkReject"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
          Ya, Hapus Semua
        </button>
      </div>
    </div>
  </div>

  <!-- Main content -->
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-gray-800">Admin Review</h1>
          <p class="text-xs text-gray-500">ngebir.di-mana.com · Bar Discovery</p>
        </div>

        <!-- Discovery trigger -->
        <button
          @click="runDiscovery"
          :disabled="discovering"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md text-sm font-medium transition-colors">
          <i :class="['fas', discovering ? 'fa-spinner fa-spin' : 'fa-search']"></i>
          {{ discovering ? 'Mencari...' : 'Jalankan Discovery Sekarang' }}
        </button>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <!-- Discovery result banner -->
      <div
        v-if="discoveryResult"
        :class="[
          'p-3 rounded-md text-sm font-medium flex items-center gap-2',
          discoveryResult.includes('baru ditemukan')
            ? 'bg-green-100 text-green-800'
            : discoveryResult.includes('Error')
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-700',
        ]">
        <i
          :class="[
            'fas',
            discoveryResult.includes('baru ditemukan')
              ? 'fa-check-circle'
              : discoveryResult.includes('Error')
                ? 'fa-exclamation-circle'
                : 'fa-info-circle',
          ]"></i>
        {{ discoveryResult }}
      </div>

      <!-- Manual add -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div>
          <h2 class="text-base font-bold text-gray-800">Tambah Bar Manual</h2>
          <p class="text-xs text-gray-500">Satu nama bar per baris (maks 15). Semua dicari di Bandung dan langsung tayang.</p>
        </div>
        <textarea
          v-model="addInput"
          rows="4"
          :disabled="addSearching || addCommitting"
          placeholder="Nama bar, satu per baris"
          class="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 disabled:opacity-60"></textarea>
        <button
          @click="previewBars"
          :disabled="addSearching || addCommitting || !addInput.trim()"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md text-sm font-medium transition-colors">
          <i :class="['fas', addSearching ? 'fa-spinner fa-spin' : 'fa-search']"></i>
          {{ addSearching ? 'Mencari...' : 'Cari' }}
        </button>

        <div v-if="addCandidates.length" class="space-y-2">
          <label
            v-for="c in addCandidates"
            :key="c.query + c.placeId"
            :class="[
              'flex items-start gap-3 p-3 border rounded-md text-sm',
              c.status === 'new' ? 'border-gray-200 cursor-pointer' : 'border-gray-100 bg-gray-50 text-gray-400',
            ]">
            <input
              type="checkbox"
              class="mt-1"
              :disabled="c.status !== 'new' || addCommitting"
              :checked="addSelected.has(c.placeId)"
              @change="toggleSelected(c.placeId)" />
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold text-gray-800">{{ c.name || c.query }}</span>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs rounded-full font-medium',
                    c.status === 'new' ? 'bg-green-100 text-green-700' : c.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600',
                  ]">
                  {{ statusLabel[c.status] }}
                </span>
              </div>
              <p v-if="c.address" class="text-xs text-gray-500 truncate">{{ c.address }}</p>
              <p v-if="c.rating" class="text-xs text-gray-500">
                <i class="fas fa-star text-yellow-400"></i> {{ c.rating }}
                <span v-if="c.reviews">({{ c.reviews.toLocaleString() }})</span>
              </p>
              <p v-if="c.reason" class="text-xs text-gray-400 truncate">{{ c.reason }}</p>
              <p v-if="c.name && c.query.toLowerCase() !== c.name.toLowerCase()" class="text-xs text-gray-400">
                dicari: {{ c.query }}
              </p>
            </div>
          </label>

          <div class="flex items-center gap-3">
            <button
              @click="commitBars"
              :disabled="addCommitting || addSelected.size === 0"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-md text-sm font-medium transition-colors">
              <i :class="['fas', addCommitting ? 'fa-spinner fa-spin' : 'fa-plus']"></i>
              Tambahkan {{ addSelected.size }} bar
            </button>
            <span v-if="addProgress" class="text-xs text-gray-500">{{ addProgress }}</span>
          </div>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-gray-800">{{ total }}</span>
          <span class="text-sm text-gray-500">cafe menunggu review</span>
        </div>
        <div class="flex flex-wrap gap-2 ml-auto text-sm">
          <span
            v-for="(count, city) in byCity"
            :key="city"
            class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
            {{ city }} <strong>{{ count }}</strong>
          </span>
        </div>
      </div>

      <!-- Bulk actions -->
      <div v-if="total > 0" class="flex gap-3">
        <button
          @click="bulkConfirm = 'publish'"
          class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
          <i class="fas fa-check-double"></i>
          Publish Semua ({{ total }})
        </button>
        <button
          @click="bulkConfirm = 'reject'"
          class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors">
          <i class="fas fa-trash"></i>
          Reject Semua ({{ total }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12 text-gray-400">
        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
        <p class="text-sm">Memuat data...</p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!loading && total === 0"
        class="text-center py-16 bg-white rounded-lg border border-gray-200">
        <div class="text-4xl mb-3">🎉</div>
        <p class="text-lg font-semibold text-gray-700">Semua sudah direview</p>
        <p class="text-sm text-gray-400 mt-1">Tidak ada cafe yang menunggu persetujuan.</p>
      </div>

      <!-- Cafe cards -->
      <div v-else class="space-y-4">
        <div
          v-for="cafe in cafes"
          :key="cafe.id"
          class="bg-white rounded-lg border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h2 class="text-base font-bold text-gray-800 truncate">{{ cafe.name }}</h2>
              <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {{ cafe.city }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
              <span v-if="cafe.rating" class="flex items-center gap-1">
                <i class="fas fa-star text-yellow-400"></i>
                {{ cafe.rating }}
                <span v-if="cafe.reviews" class="text-gray-400">({{ cafe.reviews.toLocaleString() }})</span>
              </span>
              <a
                v-if="cafe.google_place_id"
                :href="`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${cafe.google_place_id}`"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1 text-blue-500 hover:underline">
                <i class="fas fa-map-marker-alt"></i>
                Google Maps
              </a>
            </div>

            <p v-if="cafe.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
              {{ cafe.description }}
            </p>

            <div
              v-if="cafe.working_hours"
              class="text-xs text-gray-500 bg-gray-50 rounded p-2 whitespace-pre-line">{{ cafe.working_hours }}</div>
          </div>

          <!-- Actions -->
          <div class="flex sm:flex-col gap-2 shrink-0">
            <button
              @click="publish(cafe); showToast(cafe.name + ' dipublish', 'success')"
              class="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
              <i class="fas fa-check"></i>
              Publish
            </button>
            <button
              @click="reject(cafe); showToast(cafe.name + ' dihapus', 'error')"
              class="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-md text-sm font-medium transition-colors">
              <i class="fas fa-times"></i>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
