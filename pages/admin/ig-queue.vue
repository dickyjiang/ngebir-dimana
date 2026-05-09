<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface IgQueueItem {
  id: number
  cafe_id: number
  cafe_name: string
  city: string | null
  image_url: string | null
  caption: string
  hashtags: string | null
  status: 'pending' | 'posted' | 'skipped'
  created_at: string
  posted_at: string | null
}

const supabase = useSupabaseClient()

const currentStatus = ref<'pending' | 'posted' | 'skipped' | 'all'>('pending')
const items = ref<IgQueueItem[]>([])
const loading = ref(false)
const triggerLoading = ref(false)
const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastVisible.value = false), 2500)
}

async function loadQueue() {
  loading.value = true
  const q = supabase.from('ig_queue').select('*').order('created_at', { ascending: false })
  if (currentStatus.value !== 'all') q.eq('status', currentStatus.value)
  const { data } = await q
  items.value = (data as IgQueueItem[]) ?? []
  loading.value = false
}

function setTab(status: typeof currentStatus.value) {
  currentStatus.value = status
  loadQueue()
}

async function updateStatus(id: number, status: 'posted' | 'skipped') {
  const patch: Record<string, unknown> = { status }
  if (status === 'posted') patch.posted_at = new Date().toISOString()
  await supabase.from('ig_queue').update(patch).eq('id', id)
  showToast(status === 'posted' ? 'Sudah dipost!' : 'Skipped.')
  await loadQueue()
}

async function regen(queueId: number, cafeId: number) {
  showToast('Regenerating...')
  await supabase.from('ig_queue').delete().eq('id', queueId)
  await $fetch('/api/generate-caption-for-cafe', {
    method: 'POST',
    body: { cafe_id: cafeId },
  })
  setTimeout(loadQueue, 1500)
}

async function triggerGenerate() {
  let secret = localStorage.getItem('cron_secret')
  if (!secret) {
    secret = window.prompt('Masukkan CRON_SECRET:')
    if (!secret) return
    localStorage.setItem('cron_secret', secret)
  }
  triggerLoading.value = true
  try {
    await $fetch('/api/ig-generate', {
      method: 'POST',
      headers: { 'x-cron-secret': secret },
    })
    showToast('Caption baru di-generate!')
    setTimeout(loadQueue, 1500)
  } catch (err: any) {
    if (err.response?.status === 401) localStorage.removeItem('cron_secret')
    showToast('Error: ' + (err.message || 'Unknown error'))
  } finally {
    triggerLoading.value = false
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  showToast('Caption tersalin!')
}

function copyAll(caption: string, hashtags: string | null) {
  navigator.clipboard.writeText(caption + (hashtags ? '\n\n' + hashtags : ''))
  showToast('Caption + hashtag tersalin!')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadgeClass(status: string) {
  return (
    {
      pending: 'bg-amber-100 text-amber-700',
      posted: 'bg-green-100 text-green-800',
      skipped: 'bg-red-100 text-red-700',
    }[status] ?? 'bg-gray-100 text-gray-600'
  )
}

const tabs: { label: string; value: typeof currentStatus.value }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Posted', value: 'posted' },
  { label: 'Skipped', value: 'skipped' },
  { label: 'Semua', value: 'all' },
]

onMounted(loadQueue)
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-xl font-semibold text-gray-800">IG Caption Queue</h1>
        <p class="text-sm text-gray-500">Review caption, copy yang bagus, post ke Instagram</p>
      </div>
      <button
        @click="triggerGenerate"
        :disabled="triggerLoading"
        class="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
        {{ triggerLoading ? 'Generating...' : '+ Generate sekarang' }}
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-5">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="setTab(tab.value)"
        :class="currentStatus === tab.value
          ? 'bg-black text-yellow-500 border-yellow-500'
          : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'"
        class="px-4 py-1.5 rounded-full border text-xs font-medium transition-colors">
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-gray-400 text-sm">Memuat...</div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="text-center py-12 text-gray-400 text-sm">
      Tidak ada item.
    </div>

    <!-- Queue cards -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div class="grid grid-cols-[140px_1fr] max-sm:grid-cols-1">
          <!-- Image -->
          <div class="w-[140px] h-[140px] max-sm:w-full max-sm:h-40 bg-gray-100 flex items-center justify-center text-3xl shrink-0">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="($event.target as HTMLImageElement).style.display = 'none'" />
            <span v-else>🍺</span>
          </div>

          <!-- Body -->
          <div class="p-4 flex flex-col gap-2 min-w-0">
            <!-- Meta -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-semibold text-gray-800">{{ item.cafe_name }}</span>
              <span class="text-xs text-gray-500">{{ item.city }}</span>
              <span
                :class="statusBadgeClass(item.status)"
                class="text-xs px-2 py-0.5 rounded-full font-medium">
                {{ item.status }}
              </span>
              <span class="text-xs text-gray-400 ml-auto">{{ formatDate(item.created_at) }}</span>
            </div>

            <!-- Caption -->
            <div class="text-xs leading-relaxed text-gray-700 bg-gray-50 p-2 rounded-md max-h-24 overflow-y-auto whitespace-pre-wrap">
              {{ item.caption }}
            </div>

            <!-- Hashtags -->
            <div v-if="item.hashtags" class="text-xs text-green-800 leading-relaxed">
              {{ item.hashtags }}
            </div>

            <!-- Actions -->
            <div class="flex gap-2 flex-wrap mt-1">
              <button
                @click="copyAll(item.caption, item.hashtags)"
                class="px-3 py-1 text-xs border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                Copy semua
              </button>
              <button
                @click="copyText(item.caption)"
                class="px-3 py-1 text-xs border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                Copy caption
              </button>
              <template v-if="item.status === 'pending'">
                <button
                  @click="updateStatus(item.id, 'posted')"
                  class="px-3 py-1 text-xs bg-green-100 border border-green-600 text-green-800 rounded-lg hover:opacity-80 transition-opacity">
                  Sudah dipost
                </button>
                <button
                  @click="updateStatus(item.id, 'skipped')"
                  class="px-3 py-1 text-xs bg-red-100 border border-red-600 text-red-700 rounded-lg hover:opacity-80 transition-opacity">
                  Skip
                </button>
                <button
                  @click="regen(item.id, item.cafe_id)"
                  class="px-3 py-1 text-xs bg-amber-100 border border-amber-600 text-amber-700 rounded-lg hover:opacity-80 transition-opacity">
                  Regen
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <Transition name="toast-fade">
    <div
      v-if="toastVisible"
      class="fixed bottom-6 right-6 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
      {{ toastMessage }}
    </div>
  </Transition>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
