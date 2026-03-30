<script setup lang="ts">
  const route = useRoute();
  import { ref, computed, onMounted, watch } from 'vue';

  // Dynamic meta: use city from query param if present, else generic
  const cityParam = computed(() => route.query.city as string | undefined)
  const pageTitle = computed(() =>
    cityParam.value
      ? `Cafe di ${cityParam.value.charAt(0).toUpperCase() + cityParam.value.slice(1)} | Ngopi di Mana?`
      : 'Direktori Cafe Indonesia | Ngopi di Mana?'
  )
  const pageDescription = computed(() =>
    cityParam.value
      ? `Daftar cafe terbaik di ${cityParam.value} — WFC, specialty coffee, roastery, dan pet friendly.`
      : 'Temukan ribuan cafe di seluruh Indonesia — WFC, specialty coffee, roastery, pet friendly, dan banyak lagi.'
  )
  const canonicalUrl = computed(() => 'https://ngopi.di-mana.com/cafes')

  useSeoMeta({
    title: () => pageTitle.value,
    description: () => pageDescription.value,
    ogTitle: () => pageTitle.value,
    ogDescription: () => pageDescription.value,
    ogImage: 'https://ngopi.di-mana.com/img/OG-img.png',
    ogType: 'website',
    ogUrl: () => canonicalUrl.value,
  })
  useHead({ link: [{ rel: 'canonical', href: () => canonicalUrl.value }] })
  import Sidebar from '~/components/Sidebar.vue';
  import CafeList from '~/components/cafe/CafeList.vue';
  import NewCafesList from '~/components/cafe/NewCafesList.vue';
  import HeroSearch from '~/components/HeroSearch.vue';
  import '@fortawesome/fontawesome-free/css/all.css';
  import { debounce } from 'lodash';
  import { useFilterToggle } from '~/composables/useFilterToggle';
  import { useFetchCafes } from '~/composables/useFetchCafes';
  import { useNearbyFilter } from '~/composables/useNearbyFilter';

  // Use the fetching composable
  const {
    data,
    loading,
    totalCafes,
    fetchCafes: fetchCafesFromComposable,
  } = useFetchCafes();

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
  } = useNearbyFilter();

  const newCafes = ref([]);
  const loadingNewCafes = ref(false);

  const currentPage = ref(1);
  const itemsPerPage = 24;
  const searchQuery = ref('');

  // Initialize filter options with empty arrays
  const uniqueCities = ref([]);

  // Initialize activeFilters with all expected properties
  const activeFilters = ref({
    city: [],
    borough: [],
    features: [],
  });

  // Add state for sidebar visibility
  const isSidebarOpen = ref(false);

  // Get filter toggle functions from composable
  const { toggleFeature } = useFilterToggle();

  // Debounced search function
  const debouncedFetchBySearch = debounce((query, filters) => {
    currentPage.value = 1;
    fetchCafes(1, filters);
  }, 500); // 500ms delay

  async function fetchNewCafes() {
    loadingNewCafes.value = true;
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
      );
      newCafes.value = data.value || [];
    } catch (error) {
      console.error('Error fetching new cafes:', error);
      newCafes.value = [];
    } finally {
      loadingNewCafes.value = false;
    }
  }

  // Use the composable function instead of the original function
  async function fetchCafes(page, filters = null) {
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
    );
  }

  // Update the watch functionality to apply filters
  watch(
    () => [
      JSON.stringify(activeFilters.value.city),
      JSON.stringify(activeFilters.value.features),
    ],
    () => {
      currentPage.value = 1;
      fetchCafes(1, activeFilters.value);
    }
  );

  // Also watch search query to trigger filtering
  watch(searchQuery, (newQuery) => {
    debouncedFetchBySearch(newQuery, activeFilters.value);
  });

  // Use data directly
  const paginatedData = computed(() => {
    return data.value;
  });

  const totalPages = computed(() => {
    return Math.ceil(totalCafes.value / itemsPerPage);
  });

  // Handler for page changes from CafeList component
  function changePage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchCafes(page, activeFilters.value);
    }
  }

  // Wrapper function for the composable toggleNearbyFilter
  async function toggleNearbyFilter() {
    console.log('🎯 Toggle nearby filter clicked')
    await toggleNearbyFilterComposable(fetchCafes, activeFilters.value);
  }

  // Use the toggleFeature from the composable
  async function handleFeatureToggle(feature_id) {
    await toggleFeature(activeFilters.value, feature_id);
  }

  // Function to handle search from HeroSearch component
  function handleSearch(query) {
    searchQuery.value = query;
  }

  // Function to toggle sidebar
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  onMounted(async () => {
    // Fetch city options for filters first
    try {
      uniqueCities.value = await useFetchFilterOptions();

      // Parse URL parameters to set initial filters
      if (route.query) {
        // Parse city filter
        if (route.query.city) {
          const cities = route.query.city.split(',');
          activeFilters.value.city = cities;
        }
        if (route.query.features) {
          const features = route.query.features.split(',');
          activeFilters.value.features = features;
        }
      }

      // await fetchNewCafes();
      // Then fetch cafes with the initial filters
      await fetchCafes(currentPage.value, activeFilters.value);
    } catch (error) {
      console.error('Error in onMounted:', error);
    }

    // Show location permission modal on first visit
    showLocationPermissionPrompt();
  });
</script>
<template>
  <!-- Toast Notification -->
  <div
    v-if="showToast"
    class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-xs text-white transition-opacity duration-300"
    :class="{
      'bg-red-500': toastType === 'error',
      'bg-green-500': toastType === 'success',
    }"
  >
    <div class="flex items-center justify-between">
      <span>{{ toastMessage }}</span>
      <button @click="showToast = false" class="ml-4 text-white font-bold">
        ×
      </button>
    </div>
  </div>

  <!-- Manual Location Modal -->
  <div
    v-if="showLocationModal"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <h3 class="text-lg font-semibold mb-4">Set Your Location Manually</h3>
      <p class="text-sm text-gray-600 mb-4">
        We couldn't access your device location. Please enter your coordinates
        manually:
      </p>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Latitude</label
        >
        <input
          v-model="manualLatitude"
          type="number"
          step="0.000001"
          placeholder="e.g. -6.9175"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Longitude</label
        >
        <input
          v-model="manualLongitude"
          type="number"
          step="0.000001"
          placeholder="e.g. 107.6191"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div class="text-xs text-gray-500 mb-4">
        <p class="mb-2">
          <strong>How to find your coordinates:</strong>
        </p>
        <ul class="list-disc list-inside space-y-1 mb-3">
          <li>Open Google Maps and find your location</li>
          <li>Right-click on your exact location</li>
          <li>Select "What's here?" from the menu</li>
          <li>Copy the coordinates that appear</li>
        </ul>
        <p class="mt-2 mb-2">
          <strong>Or quick-select a city:</strong>
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
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
        >
          Cancel
        </button>
        <button
          @click="setManualLocation(fetchCafes, activeFilters)"
          :disabled="!isValidCoordinates"
          :class="{
            'bg-blue-500 text-white': isValidCoordinates,
            'bg-gray-300 text-gray-500': !isValidCoordinates,
          }"
          class="px-4 py-2 rounded-md"
        >
          Use Location
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
        <h3 class="text-lg font-semibold mb-2">Find Cafes Near You</h3>
        <p class="text-sm text-gray-600 mb-6">
          We'd like to use your location to show you the nearest cafes. This helps you discover great coffee spots in your area.
        </p>
        
        <div class="flex flex-col gap-3">
          <button
            @click="handleLocationPermissionResponse(true, fetchCafes)"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
            Allow Location Access
          </button>
          <button
            @click="handleLocationPermissionResponse(false, fetchCafes)"
            class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors">
            Maybe Later
          </button>
        </div>
        
        <p class="text-xs text-gray-500 mt-4">
          You can always enable location access later from your browser settings.
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
    @search="handleSearch"
    @toggle-nearby="toggleNearbyFilter"
    @toggle-feature="handleFeatureToggle"
  />

  <section id="popular-categories" class="my-4">
    <div
      class="my-4 sm:my-4 w-full py-2 sm:max-w-[90%] mx-auto flex flex-row gap-4 items-center justify-center rounded-lg"
    >
      <!-- Button removed from here -->
    </div>
  </section>
  <section id="new-cafes" class="my-4">
    <NewCafesList :cafes="newCafes" :loading="loadingNewCafes" />
  </section>

  <section id="main-content" class="flex sm:px-4 sm:max-w-[98%] mx-auto">
    <!-- Mobile Toggle Button -->
    <button
      @click="toggleSidebar"
      class="fixed bottom-4 right-4 z-50 md:hidden bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium"
      :class="{
        'text-yellow-500': activeFilters.city.length > 0,
        'text-white': activeFilters.city.length === 0,
      }"
    >
      {{ isSidebarOpen ? 'Tutup' : 'Lokasi' }}
    </button>

    <!-- Sidebar Overlay for Mobile -->
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    ></div>

    <!-- Sidebar -->
    <div
      :class="{
        'fixed inset-y-0 left-0 w-[80%] bg-white z-40 transform transition-transform duration-300 ease-in-out': true,
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
        'md:translate-x-0 md:static md:w-[20%] md:max-w-[20%] md:sticky md:top-4': true,
      }"
      class="p-4 border border-gray-400 rounded-md"
      style="max-height: 100vh; overflow-y: auto"
    >
      <Sidebar
        :activeFilters="activeFilters"
        :cities="uniqueCities"
        :onNearbyToggle="toggleNearbyFilter"
        :isNearbyActive="isNearbyActive"
        :locationLoading="locationLoading"
      />
    </div>

    <div class="px-4 flex-1">
      <!-- <WorldOfCoffeeBanner /> -->
      <CafeList
        :loading="loading"
        :cafes="paginatedData"
        :itemsPerPage="itemsPerPage"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @page-change="changePage"
      />
    </div>
  </section>
</template>
