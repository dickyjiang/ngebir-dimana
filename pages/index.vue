<script setup lang="ts">
  const route = useRoute();
  import { ref, computed, onMounted, watch } from 'vue';
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
  } = useNearbyFilter();

  // Add these variables for new cafes section
  const newCafes = ref([]);
  const loadingNewCafes = ref(false);

  const currentPage = ref(1);
  const itemsPerPage = 12;
  const searchQuery = ref('');

  // Initialize filter options with empty arrays
  const uniqueCities = ref([]);
  const zoom = ref(6);

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
        10,
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
    // console.log('Search query changed:', newQuery);
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
  const mainContent = ref(null);
  function changePage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchCafes(page, activeFilters.value);
      // Add scroll behavior
      mainContent.value?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Wrapper function for the composable toggleNearbyFilter
  async function toggleNearbyFilter() {
    await toggleNearbyFilterComposable(activeFilters.value, fetchCafes);
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
          activeFilters.value.features = cities;
        }
      }

      // Then fetch cafes with the initial filters
      await fetchNewCafes();
      await fetchCafes(currentPage.value, activeFilters.value);
    } catch (error) {
      console.error('Error in onMounted:', error);
    }

    // Automatically trigger nearby cafes functionality on load if needed
    // toggleNearbyFilter();
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
        <p>
          Tip: You can get your coordinates from Google Maps by right-clicking
          on your location and selecting "What's here?"
        </p>
      </div>

      <div class="flex justify-end gap-2">
        <button
          @click="showLocationModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
        >
          Cancel
        </button>
        <button
          @click="setManualLocation"
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
  <!-- @budi slot untuk cafe terbaru - kalau banyak akan animated slide -->
  <section id="new-cafes" class="my-4">
    <NewCafesList :cafes="newCafes" :loading="loadingNewCafes" />
  </section>
  <!-- Add ref to the main-content section -->
  <section
    id="main-content"
    ref="mainContent"
    class="flex sm:px-4 sm:max-w-[98%] mx-auto"
  >
    <!-- Mobile Toggle Button -->
    <button
      @click="toggleSidebar"
      class="fixed bottom-4 right-4 z-50 md:hidden bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium"
    >
      {{ isSidebarOpen ? 'Close' : 'Filter' }}
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
        'md:translate-x-0 md:static md:w-[20%] md:max-w-[20%] md:sticky md:top-0': true,
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

    <div class="p-4 flex-1">
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

<style scoped>
  @font-face {
    font-family: 'Sharp Grotesk';
    src: url('~/assets/fonts/sharp-grotesk-medium-25-regular.woff')
      format('woff');
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
