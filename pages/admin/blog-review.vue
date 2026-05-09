<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface BlogDraft {
  id: number
  title: string
  slug: string
  description: string | null
  content: string | null
  cover_image_url: string | null
  category: string | null
  published_at: string
  created_at: string
}

// ── Data ───────────────────────────────────────────────────────────────────
const drafts = ref<BlogDraft[]>([])
const loading = ref(false)
const expanded = ref<number | null>(null)

async function loadDrafts() {
  loading.value = true
  try {
    const data = await $fetch<BlogDraft[]>('/api/admin/blog-drafts')
    drafts.value = data ?? []
  } catch (err) {
    console.error('[admin/blog-review] loadDrafts error:', err)
    drafts.value = []
  } finally {
    loading.value = false
  }
}

const total = computed(() => drafts.value.length)

// ── Actions ────────────────────────────────────────────────────────────────
const toast = ref<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 4000)
}

async function publish(draft: BlogDraft) {
  drafts.value = drafts.value.filter((d) => d.id !== draft.id)
  await $fetch('/api/admin/blog-drafts', { method: 'PATCH', body: { ids: [draft.id], action: 'publish' } })
  showToast(`"${draft.title}" dipublish!`, 'success')
}

async function deleteDraft(draft: BlogDraft) {
  drafts.value = drafts.value.filter((d) => d.id !== draft.id)
  await $fetch('/api/admin/blog-drafts', { method: 'PATCH', body: { ids: [draft.id], action: 'delete' } })
  showToast(`"${draft.title}" dihapus`, 'error')
}

// ── Bulk confirm ───────────────────────────────────────────────────────────
const bulkConfirm = ref<null | 'publish' | 'delete'>(null)

async function bulkPublish() {
  const ids = drafts.value.map((d) => d.id)
  drafts.value = []
  bulkConfirm.value = null
  await $fetch('/api/admin/blog-drafts', { method: 'PATCH', body: { ids, action: 'publish' } })
  showToast(`${ids.length} artikel dipublish`, 'success')
}

async function bulkDelete() {
  const ids = drafts.value.map((d) => d.id)
  drafts.value = []
  bulkConfirm.value = null
  await $fetch('/api/admin/blog-drafts', { method: 'PATCH', body: { ids, action: 'delete' } })
  showToast(`${ids.length} artikel dihapus`, 'error')
}

// ── Mount ──────────────────────────────────────────────────────────────────
onMounted(() => {
  loadDrafts()
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
        <button @click="toast = null" class="ml-4 text-gray-500 hover:text-gray-700">✕</button>
      </div>
    </div>
  </Transition>

  <!-- Bulk confirm modal -->
  <div
    v-if="bulkConfirm"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-2">
        {{ bulkConfirm === 'publish' ? 'Publish semua draft?' : 'Hapus semua draft?' }}
      </h3>
      <p class="text-sm text-gray-600 mb-6">
        {{ bulkConfirm === 'publish'
          ? `${total} artikel akan dipublish sekaligus.`
          : `${total} artikel akan dihapus permanen.` }}
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
          @click="bulkDelete"
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
          <h1 class="text-lg font-bold text-gray-800">Blog Review</h1>
          <p class="text-xs text-gray-500">ngebir-dimana.com · Draft Artikel</p>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <!-- Stats bar -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
        <span class="text-2xl font-bold text-gray-800">{{ total }}</span>
        <span class="text-sm text-gray-500">draft menunggu review</span>
      </div>

      <!-- Bulk actions -->
      <div v-if="total > 0" class="flex gap-3">
        <button
          @click="bulkConfirm = 'publish'"
          class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
          ✓ Publish Semua ({{ total }})
        </button>
        <button
          @click="bulkConfirm = 'delete'"
          class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors">
          🗑 Hapus Semua ({{ total }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12 text-gray-400">
        <p class="text-sm">Memuat draft...</p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!loading && total === 0"
        class="text-center py-16 bg-white rounded-lg border border-gray-200">
        <div class="text-4xl mb-3">✅</div>
        <p class="text-lg font-semibold text-gray-700">Tidak ada draft</p>
        <p class="text-sm text-gray-400 mt-1">Semua artikel sudah dipublish atau belum ada draft baru.</p>
      </div>

      <!-- Draft cards -->
      <div v-else class="space-y-4">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Card header -->
          <div class="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
            <!-- Cover image -->
            <img
              v-if="draft.cover_image_url"
              :src="draft.cover_image_url"
              :alt="draft.title"
              class="w-full sm:w-32 h-20 object-cover rounded-md shrink-0 bg-gray-100" />
            <div v-else class="w-full sm:w-32 h-20 bg-gray-100 rounded-md shrink-0 flex items-center justify-center text-gray-400 text-xs">
              No image
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h2 class="text-base font-bold text-gray-800">{{ draft.title }}</h2>
                <span
                  v-if="draft.category"
                  class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  {{ draft.category }}
                </span>
              </div>
              <p v-if="draft.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
                {{ draft.description }}
              </p>
              <div class="flex flex-wrap gap-3 text-xs text-gray-400">
                <span>ID: {{ draft.id }}</span>
                <span>Dibuat: {{ draft.created_at?.split('T')[0] }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex sm:flex-col gap-2 shrink-0">
              <button
                @click="publish(draft)"
                class="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
                ✓ Publish
              </button>
              <button
                @click="expanded = expanded === draft.id ? null : draft.id"
                class="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors">
                {{ expanded === draft.id ? '▲ Tutup' : '▼ Konten' }}
              </button>
              <button
                @click="deleteDraft(draft)"
                class="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-md text-sm font-medium transition-colors">
                🗑 Hapus
              </button>
            </div>
          </div>

          <!-- Expandable content preview -->
          <div
            v-if="expanded === draft.id"
            class="border-t border-gray-100 p-5 bg-gray-50 prose prose-sm max-w-none overflow-auto max-h-96"
            v-html="draft.content ?? '(kosong)'">
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
