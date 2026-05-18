<script setup lang="ts">
const route = useRoute()
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import CafeList from '~/components/cafe/CafeList.vue'
import NewCafesList from '~/components/cafe/NewCafesList.vue'
import HeroSearch from '~/components/HeroSearch.vue'
import WorldOfCoffeeBanner from '~/components/WorldOfCoffeeBanner.vue'
import '@fortawesome/fontawesome-free/css/all.css'
import { useFilterToggle } from '~/composables/useFilterToggle'
import { useFetchCafes } from '~/composables/useFetchCafes'
import { useNearbyFilter } from '~/composables/useNearbyFilter'
import { useHead } from '#imports'
import { useAnalytics } from '~/composables/useAnalytics'
import { useBlog } from '~/composables/useBlog'
import BlogCard from '~/components/blog/BlogCard.vue'
import type { BlogPost } from '~/composables/useBlog'

useSeoMeta({
  title: 'Ngebir Dimana? | Direktori Bar Indonesia Terlengkap',
  description: 'Temukan ribuan bar di Indonesia — dari craft beer, rooftop bar, sports bar, hingga brewery. Satu klik, ribuan pilihan.',
  ogTitle: 'Ngebir Dimana? | Direktori Bar Indonesia Terlengkap',
  ogDescription: 'Temukan ribuan bar di Indonesia — dari craft beer, rooftop bar, sports bar, hingga brewery. Satu klik, ribuan pilihan.',
  ogImage: 'https://ngebir.di-mana.com/img/OG-img.png',
  ogType: 'website',
  ogUrl: 'https://ngebir.di-mana.com',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://ngebir.di-mana.com' }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "WebSite",
        "name": "ngebir-dimana",
        "url": "https://ngebir.di-mana.com/",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://ngebir.di-mana.com/cafes?city=bandung&features={search_term_string}/cafes?city=bandung&features=",
          "query-input": "required name=search_term_string"
        }
      })
    }
  ]
})

// Use the fetching composable
const { data, loading, totalCafes, fetchCafes: fetchCafesFromComposable } = useFetchCafes()

// Use the nearby filter composable
const {
  userLocation,
  locationLoading,
  locationError,
  isNearbyActive,
  showLocationModal,
  manualLatitude,
  manualLongitude,
  showToast,
  toastMessage,
  toastType,
  isValidCoordinates,
  getUserLocation,
  setManualLocation,
  calculateDistance,
  toggleNearbyFilter: toggleNearbyFilterComposable,
  showLocationPermissionPrompt,
  handleLocationPermissionResponse,
  showLocationPermissionModal,
  hasSeenLocationModal,
} = useNearbyFilter()

// Add these variables for new cafes section
const newCafes = ref([])
const loadingNewCafes = ref(false)

const currentPage = ref(1)
const itemsPerPage = 24
const searchQuery = ref('')
const filterType = ref('all') // Add this new ref
const noResultsMessage = ref('')
const isFallingBack = ref(false)

// Initialize filter options with correct structure
const uniqueCities = ref({ parentCities: [], childCities: [] })
const zoom = ref(6)

// Initialize activeFilters with all expected properties
const activeFilters = ref({
  city: [],
  borough: [],
  features: [],
})

// Add state for sidebar visibility
const isSidebarOpen = ref(false)

// Get filter toggle functions from composable
const { toggleFilter, toggleFeature, resetFiltersCity } = useFilterToggle()

const { trackSearch, setupScrollTracking } = useAnalytics()

const latestBlogPosts = ref<BlogPost[]>([])
const { fetchLatestPosts } = useBlog()

const isShowingFallback = ref(false)

async function fetchNewCafes() {
  loadingNewCafes.value = true
  try {
    await fetchCafesFromComposable(
      1,
      itemsPerPage,
      {
        city: [],
        borough: [],
        features: [],
      },
      '',
      false,
      null
    )
    newCafes.value = data.value || []
  } catch (error) {
    console.error('Error fetching new cafes:', error)
    newCafes.value = []
  } finally {
    loadingNewCafes.value = false
  }
}
// Use the composable function instead of the original function
async function fetchCafes(page, filters = null) {
  // Skip fetches triggered by the fallback search query reset
  if (isFallingBack.value) return

  console.log('🔍 Fetching cafes:', {
    page,
    filters,
    isNearbyActive: isNearbyActive.value,
    hasLocation: !!userLocation.value
  })

  await fetchCafesFromComposable(
    page,
    itemsPerPage,
    filters,
    searchQuery.value,
    isNearbyActive.value,
    userLocation.value
  )

  // If no results found and there was an active filter/search, fallback to showing all cafes
  if (data.value.length === 0 && (isNearbyActive.value || searchQuery.value?.trim())) {
    if (isNearbyActive.value) {
      noResultsMessage.value = 'Tidak ada tempat nge-bir ditemukan di area Anda. Menampilkan semua tempat nge-bir.'
    } else {
      noResultsMessage.value = 'Tidak ada hasil untuk pencarian Anda. Menampilkan semua tempat nge-bir.'
    }
    isShowingFallback.value = true

    // Deactivate nearby filter if it was active
    if (isNearbyActive.value) {
      isNearbyActive.value = false
      if (typeof window !== 'undefined') {
        localStorage.setItem('isNearbyActive', 'false')
      }
    }

    // Clear search query without triggering watcher-based re-fetch
    isFallingBack.value = true
    searchQuery.value = ''
    await nextTick()
    isFallingBack.value = false

    // Re-fetch all cafes without filters
    await fetchCafesFromComposable(1, itemsPerPage, activeFilters.value, '', false, null)
    currentPage.value = 1
  } else if (data.value.length > 0 && !isShowingFallback.value) {
    // Clear no-results message once cafes are found (but not during fallback)
    noResultsMessage.value = ''
  }
}

// Watch filters — pass current searchQuery so typed search is not lost when a filter toggles
watch(
  () => [JSON.stringify(activeFilters.value.city), JSON.stringify(activeFilters.value.features)],
  () => {
    isShowingFallback.value = false
    noResultsMessage.value = ''
    currentPage.value = 1
    fetchCafes(1, activeFilters.value)
  }
)

// Watch search query — debounce is handled in HeroSearch component
watch(searchQuery, (newQuery) => {
  if (isFallingBack.value) return
  isShowingFallback.value = false
  noResultsMessage.value = ''
  currentPage.value = 1
  if (newQuery?.trim()) {
    trackSearch(newQuery.trim())
  }
  fetchCafes(1, activeFilters.value)
})

// Use data directly
const paginatedData = computed(() => {
  return data.value
})

const totalPages = computed(() => {
  return Math.ceil(totalCafes.value / itemsPerPage)
})

// Handler for page changes from CafeList component
const mainContent = ref(null)
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchCafes(page, activeFilters.value)
    // Add scroll behavior
    mainContent.value?.scrollIntoView({ behavior: 'smooth' })
  }
}

// Wrapper function for the composable toggleNearbyFilter
async function toggleNearbyFilter() {
  console.log('🎯 Toggle nearby filter clicked')
  await toggleNearbyFilterComposable(fetchCafes, activeFilters.value)
}

// Use the toggleFeature from the composable
async function handleFeatureToggle(feature_id) {
  await toggleFeature(activeFilters.value, feature_id)
}

async function handleCityToggle(citySlug) {
  await toggleFilter(activeFilters.value, 'city', citySlug)
}

async function handleCityReset() {
  await resetFiltersCity(activeFilters.value)
}

// Function to handle search from HeroSearch component
// HeroSearch emits { query, filter } — unpack correctly
function handleSearch(payload) {
  searchQuery.value = typeof payload === 'object' ? (payload.query ?? '') : (payload ?? '')
}

// Function to toggle sidebar
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(async () => {
  // Fetch city options for filters first
  try {
    uniqueCities.value = await useFetchFilterOptions()
    console.log('uniqueCities after fetch:', JSON.stringify(uniqueCities.value, null, 2))

    // Parse URL parameters to set initial filters
    if (route.query) {
      // Parse city filter
      if (route.query.city) {
        const cities = route.query.city.split(',')
        activeFilters.value.city = cities
      }
      if (route.query.features) {
        const features = route.query.features.split(',')
        activeFilters.value.features = features
      }
    }

    // Then fetch cafes with the initial filters
    await fetchCafes(currentPage.value, activeFilters.value)
  } catch (error) {
    console.error('Error in onMounted:', error)
  }

  // Show location permission modal on first visit
  showLocationPermissionPrompt()

  // Set up scroll depth tracking — fires listing_scroll at 25/50/75/100% milestones
  setupScrollTracking()

  // Fetch 3 latest blog posts for the homepage preview section
  latestBlogPosts.value = await fetchLatestPosts()
})
</script>

<template>
  <!-- Toast Notification -->
  <div
    v-if="showToast"
    class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-xs text-white transition-opacity duration-300"
    :class="{
      'bg-red-500': toastType === 'error',
      'bg-green-500': toastType === 'success',
    }">
    <div class="flex items-center justify-between">
      <span>{{ toastMessage }}</span>
      <button @click="showToast = false" class="ml-4 text-white font-bold">×</button>
    </div>
  </div>

  <!-- Manual Location Modal -->
  <div
    v-if="showLocationModal"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <h3 class="text-lg font-semibold mb-4">Atur Lokasi Secara Manual</h3>
      <p class="text-sm text-gray-600 mb-4">
        Kami tidak dapat mengakses lokasi perangkat Anda. Silakan masukkan koordinat secara manual:
      </p>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Lintang (Latitude)</label>
        <input
          v-model="manualLatitude"
          type="number"
          step="0.000001"
          placeholder="contoh: -6.9175"
          class="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Bujur (Longitude)</label>
        <input
          v-model="manualLongitude"
          type="number"
          step="0.000001"
          placeholder="contoh: 107.6191"
          class="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>

      <div class="text-xs text-gray-500 mb-4">
        <p class="mb-2">
          <strong>Cara menemukan koordinat Anda:</strong>
        </p>
        <ul class="list-disc list-inside space-y-1 mb-3">
          <li>Buka Google Maps dan temukan lokasi Anda</li>
          <li>Klik kanan pada lokasi yang tepat</li>
          <li>Pilih "What's here?" dari menu</li>
          <li>Salin koordinat yang muncul</li>
        </ul>
        <p class="mt-2 mb-2">
          <strong>Atau pilih kota cepat:</strong>
        </p>
        <div class="flex flex-wrap gap-1">
          <button @click="manualLatitude = '-6.2088'; manualLongitude = '106.8456'" class="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors">Jakarta</button>
          <button @click="manualLatitude = '-6.9175'; manualLongitude = '107.6191'" class="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors">Bandung</button>
          <button @click="manualLatitude = '-7.2575'; manualLongitude = '112.7521'" class="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors">Surabaya</button>
          <button @click="manualLatitude = '-8.6500'; manualLongitude = '115.2167'" class="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors">Bali</button>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button
          @click="showLocationModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700">
          Batal
        </button>
        <button
          @click="setManualLocation(fetchCafes, activeFilters)"
          :disabled="!isValidCoordinates"
          :class="{
            'bg-blue-500 text-white': isValidCoordinates,
            'bg-gray-300 text-gray-500': !isValidCoordinates,
          }"
          class="px-4 py-2 rounded-md">
          Gunakan Lokasi
        </button>
      </div>
    </div>
  </div>

  <!-- Location Permission Modal -->
  <div
    v-if="showLocationPermissionModal"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <i class="fas fa-map-marker-alt text-blue-600 text-xl"></i>
        </div>
        <h3 class="text-lg font-semibold mb-2">Temukan Bar Terdekat</h3>
        <p class="text-sm text-gray-600 mb-6">
          Kami ingin menggunakan lokasi Anda untuk menampilkan bar-bar terdekat. Ini membantu Anda menemukan tempat ngebir terbaik di sekitar Anda.
        </p>
        
        <div class="flex flex-col gap-3">
          <button
            @click="handleLocationPermissionResponse(true, fetchCafes, activeFilters)"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
            Izinkan Akses Lokasi
          </button>
          <button
            @click="handleLocationPermissionResponse(false, fetchCafes, activeFilters)"
            class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors">
            Nanti Saja
          </button>
        </div>
        
        <p class="text-xs text-gray-500 mt-4">
          Anda dapat mengaktifkan akses lokasi kapan saja melalui pengaturan browser.
        </p>
      </div>
    </div>
  </div>

  <!-- Use the HeroSearch component -->
  <HeroSearch
    :totalCafes="totalCafes"
    :activeFilters="activeFilters"
    :isNearbyActive="isNearbyActive"
    :locationLoading="locationLoading"
    :noResultsMessage="noResultsMessage"
    @search="handleSearch"
    @toggle-nearby="toggleNearbyFilter"
    @toggle-feature="handleFeatureToggle" />

  <section id="popular-categories" class="my-4">
    <div
      class="my-4 sm:my-4 w-full py-2 sm:max-w-[90%] mx-auto flex flex-row gap-4 items-center justify-center rounded-lg">
      <!-- Button removed from here -->
    </div>
  </section>
  <!-- @budi slot untuk cafe terbaru - kalau banyak akan animated slide -->
  <section id="new-cafes" class="my-4">
    <NewCafesList :cafes="newCafes" :loading="loadingNewCafes" />
  </section>

  <!-- Artikel & Tips — 3 latest blog posts -->
  <section id="blog-preview" class="my-4 sm:px-4 sm:max-w-[98%] mx-auto">
    <div class="flex items-center justify-between mb-4 px-4 sm:px-0">
      <h2 class="text-xl font-semibold text-gray-800">Artikel &amp; Tips</h2>
      <NuxtLink to="/blog" class="text-sm text-gray-500 hover:text-gray-800 hover:underline">
        Lihat Semua →
      </NuxtLink>
    </div>
    <ul class="flex gap-2 sm:gap-4 overflow-x-auto sm:overflow-x-visible px-4 sm:px-0 pb-2 scrollbar-hide">
      <BlogCard
        v-for="post in latestBlogPosts"
        :key="post.id"
        :post="post"
        class="flex-shrink-0 w-[calc((100vw-3.5rem)/2.8)] sm:flex-1 sm:min-w-0 sm:w-auto"
      />
    </ul>
  </section>

  <!-- Add ref to the main-content section -->
  <section id="main-content" ref="mainContent" class="flex sm:px-4 sm:max-w-[98%] mx-auto">
    <!-- Mobile Toggle Button -->
    <button
      @click="toggleSidebar"
      class="fixed bottom-4 right-4 z-50 md:hidden bg-gray-800 px-6 py-3 rounded-full shadow-lg text-sm font-medium"
      :class="{
        'text-yellow-500': activeFilters.city.length > 0,
        'text-white': activeFilters.city.length === 0,
      }">
      {{ isSidebarOpen ? 'Tutup' : 'Lokasi' }}
    </button>

    <!-- Sidebar Overlay for Mobile -->
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"></div>

    <!-- Sidebar -->
    <div
      :class="{
        'fixed inset-y-0 left-0 w-[80%] bg-white z-40 transform transition-transform duration-300 ease-in-out md:bg-transparent': true,
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
        'md:translate-x-0 md:static  md:max-w-[20%] md:sticky md:top-4': true,
      }"
      class="p-4 border border-gray-400 rounded-md"
      style="max-height: 100vh; overflow-y: auto">
      <Sidebar
        :activeFilters="activeFilters"
        :cities="uniqueCities"
        :onNearbyToggle="toggleNearbyFilter"
        :isNearbyActive="isNearbyActive"
        :locationLoading="locationLoading"
        @toggle-city="handleCityToggle"
        @reset-cities="handleCityReset" />
    </div>

    <div class="px-4 flex-1">
      <!-- <WorldOfCoffeeBanner /> -->
      <CafeList
        :loading="loading"
        :cafes="paginatedData"
        :itemsPerPage="itemsPerPage"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :bannerPosition="12"
        @page-change="changePage" />
    </div>
  </section>
</template>

<style scoped>
@font-face {
  font-family: 'Sharp Grotesk';
  src: url('~/assets/fonts/sharp-grotesk-medium-25-regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

h1 {
  font-family: 'Sharp Grotesk', sans-serif; /* Fallback to sans-serif */
}

/* Global focus styles */
:focus {
  outline: none !important;
  box-shadow: 0 0 0 1px black !important;
}

:focus:not(:focus-visible) {
  box-shadow: none !important;
}

:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 1px black !important;
}
</style>
