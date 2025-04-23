<script setup lang="ts">
  // http://localhost:3000/city=dd+bbb&features=ddf+ddf2
  const route = useRoute();
  // { filters: [ 'city=dd+bbb&features=ddf+ddf2' ] }
  import { ref, computed, onMounted, watch } from 'vue';
  import Sidebar from '~/components/Sidebar.vue';
  import '@fortawesome/fontawesome-free/css/all.css';
  import { debounce } from 'lodash';

  const data = ref([]);
  const loading = ref(true);
  const currentPage = ref(1);
  const itemsPerPage = 12;
  const searchQuery = ref('');

  // Add state for user location and nearby filter
  const userLocation = ref(null);
  const locationLoading = ref(false);
  const locationError = ref(null);
  const isNearbyActive = ref(false);

  // Initialize activeFilters with all expected properties
  const activeFilters = ref({ rating: [], range: [], city: [], borough: [] });

  // Add state for sidebar visibility
  const isSidebarOpen = ref(false);

  // Add a new ref for toast notifications
  const showToast = ref(false);
  const toastMessage = ref('');
  const toastType = ref('error'); // 'error' or 'success'

  // Add these refs for the manual location modal
  const showLocationModal = ref(false);
  const manualLatitude = ref(null);
  const manualLongitude = ref(null);

  // Debounced search function
  const debouncedFetchBySearch = debounce((query, filters) => {
    currentPage.value = 1;
    fetchCafes(1, filters);
  }, 500); // 500ms delay

  // Change the fetchCafes function to include filter parameters
  async function fetchCafes(page, filters = null) {
    // Use a cache key that represents the current filters and page

    loading.value = true;
    // const { $supabase } = useNuxtApp();

    // Calculate range based on current page
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    try {
      let payload = {};
      if (filters) {
        payload = {
          city: filters.city || [],
          ratings: filters.rating || [],
          ranges: filters.range || [],
          from: from,
          to: to,
          searchQuery: searchQuery.value || '',
        };
        if (isNearbyActive.value) {
          payload.cariLocation = true;
          payload.latitude = userLocation.value.latitude || null;
          payload.longitude = userLocation.value.longitude || null;
        }
      }

      const hasil = await $fetch('/api/search', {
        method: 'POST',
        body: payload,
        headers: useRequestHeaders(['cookie']),
      });
      totalCafes.value = hasil.count || 0;
      data.value = hasil.data || [];
    } catch (err) {
      console.error('Exception while fetching cafes:', err);
    } finally {
      loading.value = false;
    }
  }

  // Update the watch functionality to apply filters
  watch(
    () => [
      JSON.stringify(activeFilters.value.city),
      JSON.stringify(activeFilters.value.borough),
      JSON.stringify(activeFilters.value.rating),
      JSON.stringify(activeFilters.value.range),
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

  // Remove the filteredData computed property since we're now filtering in the database
  // Instead, use data directly
  const paginatedData = computed(() => {
    return data.value;
  });

  const totalPages = computed(() => {
    return Math.ceil(totalCafes.value / itemsPerPage);
  });

  const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 5;
    const startPage = Math.max(
      1,
      currentPage.value - Math.floor(maxVisible / 2)
    );
    const endPage = Math.min(totalPages.value, startPage + maxVisible - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  });

  // Add a computed property to calculate the total number of cafes
  const totalCafes = ref(0);

  // Initialize filter options with empty arrays
  const uniqueCities = ref([]);
  const uniqueRatings = ref([]);
  const uniquePriceRanges = ref([]);

  // Modify fetchFilterOptions to use caching
  async function fetchFilterOptions() {
    // const { data: cities } = await useFetchCity();
    // console.log('Fetched cities:', cities);

    const cities = await $fetch('/api/city', {
      headers: useRequestHeaders(['cookie']),
      method: 'get',
    });
    if (cities.length > 0) {
      // uniqueCities.value = cities.map((item) => item.city).sort();
      uniqueCities.value = cities;
    }

    const ratings = await $fetch('/api/ratings', {
      headers: useRequestHeaders(['cookie']),
      method: 'get',
    });
    if (ratings.length > 0) {
      uniqueRatings.value = ratings;
    }

    const prices = await $fetch('/api/prices', {
      headers: useRequestHeaders(['cookie']),
      method: 'get',
    });
    if (prices.length > 0) {
      uniquePriceRanges.value = prices;
    }
  }

  // Extract popular categories from the about field

  function changePage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;

      // Use different fetch function based on whether nearby filter is active
      fetchCafes(page, activeFilters.value);
    }
  }

  // Computed property to validate coordinates
  const isValidCoordinates = computed(() => {
    const lat = parseFloat(manualLatitude.value);
    const lng = parseFloat(manualLongitude.value);

    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  // Function to set location manually
  async function setManualLocation() {
    if (!isValidCoordinates.value) return;

    userLocation.value = {
      latitude: parseFloat(manualLatitude.value),
      longitude: parseFloat(manualLongitude.value),
    };

    // console.log('Manual location set:', userLocation.value);
    showLocationModal.value = false;

    // Continue with nearby filter
    isNearbyActive.value = true;

    await fetchCafes(1, activeFilters.value);
    // Show success message
    toastMessage.value = 'Location set manually. Finding nearby cafes...';
    toastType.value = 'success';
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }

  // Modify the getUserLocation to show an option for manual input
  async function getUserLocation() {
    if (userLocation.value) {
      // If we already have the location, just use it
      return userLocation.value;
    }

    locationLoading.value = true;
    locationError.value = null;

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        // console.warn('Geolocation is not supported by your browser');
        locationError.value = 'Geolocation is not supported by your browser';
        throw new Error('Geolocation not supported');
      }

      // Get current position with a shorter timeout
      const position = await new Promise((resolve, reject) => {
        // iOS Safari needs secure context (HTTPS) to use geolocation
        // Also, iOS requires explicit user interaction for geolocation permissions
        const geoOptions = {
          enableHighAccuracy: true, // Set to true for iOS
          timeout: 15000, // Increased timeout for iOS (15 seconds)
          maximumAge: 0, // Don't use cached position on iOS
        };

        const handleSuccess = (position) => {
          // console.log('Geolocation success:', position);
          resolve(position);
        };

        const handleError = (error) => {
          // console.warn(`Geolocation error (${error.code}): ${error.message}`);
          reject(error);
        };

        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          handleError,
          geoOptions
        );
      });

      userLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // console.log('User location:', userLocation.value);
      return userLocation.value;
    } catch (error) {
      // console.error('Error getting user location:', error);

      // More user-friendly error message for common geolocation errors
      if (error.code === 1) {
        locationError.value =
          'Location access was denied. Please enable location services for this website in your browser settings.';
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE - More detailed guidance
        locationError.value =
          "Unable to determine your location. Please check that:\n\n1. Your device's location is turned on\n2. You're using a secure connection (HTTPS)\n3. You're not in private/incognito mode\n4. You've granted location permissions";

        // Show the manual location input modal
        showLocationModal.value = true;
      } else if (error.code === 3) {
        locationError.value =
          'Location request timed out. Please try again with a better connection.';
      } else {
        locationError.value = error.message || 'Unable to get your location';
      }

      throw error;
    } finally {
      locationLoading.value = false;
    }
  }

  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Modify toggleNearbyFilter to handle manual location input option
  async function toggleNearbyFilter() {
    try {
      if (isNearbyActive.value) {
        // If already active, deactivate it
        isNearbyActive.value = false;
        // Clear any city filters that might have been set
        activeFilters.value.city = [];
        activeFilters.value.borough = [];
        // Fetch all cafes
        fetchCafes(1, activeFilters.value);
        return;
      }

      // Before requesting location, show instructions toast for better UX
      toastMessage.value =
        "Please allow location access when prompted. Make sure you're using HTTPS and location is enabled.";
      toastType.value = 'success';
      showToast.value = true;

      // Hide after 5 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 5000);

      // Get user location
      try {
        await getUserLocation();
      } catch (error) {
        // Don't show error toast if we're showing the manual location modal instead
        if (!showLocationModal.value) {
          // Show a toast notification for location errors
          toastMessage.value =
            locationError.value || 'Unable to get your location';
          toastType.value = 'error';
          showToast.value = true;

          // Hide toast after 8 seconds (longer for detailed error messages)
          setTimeout(() => {
            showToast.value = false;
          }, 8000);
        }

        // Only exit if we're not showing the manual location modal
        if (!showLocationModal.value) {
          return; // Exit the function if location can't be obtained and not showing manual modal
        }
      }

      if (!userLocation.value && !showLocationModal.value) {
        // console.error('No user location available');
        toastMessage.value =
          'Unable to get your location. Do you want to enter it manually?';
        toastType.value = 'error';
        showToast.value = true;

        setTimeout(() => {
          showToast.value = false;
          // Show manual location modal as a fallback
          showLocationModal.value = true;
        }, 3000);

        return;
      }

      // If we have a location (auto or manual) and we're not showing the modal
      if (userLocation.value && !showLocationModal.value) {
        isNearbyActive.value = true;

        await fetchCafes(1, activeFilters.value);
      }
    } catch (error) {
      // console.error('Error toggling nearby filter:', error);
      isNearbyActive.value = false;

      toastMessage.value = 'An error occurred. Please try again.';
      toastType.value = 'error';
      showToast.value = true;

      setTimeout(() => {
        showToast.value = false;
      }, 5000);
    }
  }

  // Function to toggle sidebar
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  onMounted(async () => {
    // Fetch city options for filters first
    await fetchFilterOptions();
    // Then fetch cafe data for the current page (no filters initially)
    // Parse URL parameters to set initial filters
    if (route.query) {
      // Parse city filter
      if (route.query.city) {
        const cities = route.query.city.split('-');
        activeFilters.value.city = cities;
      }

      // Parse ratings filter
      if (route.query.ratings) {
        const ratings = route.query.ratings.split('-');
        activeFilters.value.rating = ratings;
      }

      // Parse ranges filter
      if (route.query.ranges) {
        const ranges = route.query.ranges.split('-');
        activeFilters.value.range = ranges;
      }
    }

    // Then fetch cafes with the initial filters
    await fetchCafes(currentPage.value, activeFilters.value);
    // await fetchCafes(currentPage.value);
    // Automatically trigger nearby cafes functionality on load
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

  <section id="hero" class="my-4 px-4">
    <div
      class="container mx-auto lg:max-w-[98%] py-8 rounded-2xl overflow-clip relative flex items-center justify-center"
    >
      <img
        class="absolute object-cover object-center w-full h-full"
        src="/src/assets/img/hero.webp"
        alt="hero image"
      />
      <div class="absolute inset-0 bg-black opacity-60 z-[1]"></div>
      <div
        class="z-[2] flex flex-col items-center justify-center w-[90%] sm:w-[90%] mx-auto h-full"
      >
        <h1
          class="text-2xl sm:text-4xl md:text-5xl text-white text-center font-medium tracking-wide mb-2 sm:mb-4"
        >
          Ngopi di mana?
        </h1>
        <h2
          class="text-sm md:text-xl tracking-wide text-white mb-2 sm:mb-4 text-center"
        >
          {{ totalCafes }} Cafe's Directory
        </h2>
        <div
          class="mt-2 sm:mt-4 w-full md:w-3/4 flex flex-col gap-2 sm:gap-4 items-center justify-center px-4"
        >
          <div class="flex items-center gap-2 w-full md:w-1/2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search cafes..."
              class="text-sm sm:text-base border w-full border-gray-600 rounded-lg p-2 sm:p-3 pr-8"
            />
            <button class="text-gray-500 -ml-10">
              <i class="fas fa-search"></i>
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2 w-full">
            <button
              @click="toggleNearbyFilter"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  isNearbyActive,
                'text-gray-100 border border-gray-400': !isNearbyActive,
              }"
              class="mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              <span
                v-if="locationLoading"
                class="inline-block w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                :class="{
                  'border-yellow-500': isNearbyActive,
                  'border-black': !isNearbyActive,
                }"
              ></span>
              <span>Cafe terdekat</span>
            </button>
            <!-- @budi new filter -->
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              Cafe Terbaru
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              WFC Friendly
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              Pet Friendly
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              Family Friendly
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              Wheelchair Friendly
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              24 jam
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              tempat nongkrong hits
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              pemandangan
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              Outdoor
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              instagramable
            </button>
          </div>
        </div>
        <
      </div>
    </div>
  </section>
  <section id="popular-categories" class="my-4">
    <div
      class="my-4 sm:my-4 w-full py-2 sm:max-w-[90%] mx-auto flex flex-row gap-4 items-center justify-center rounded-lg"
    >
      <!-- Button removed from here -->
    </div>
  </section>
  <!-- @budi slot untuk cafe terbaru - kalau banyak akan animated slide -->
  <section id="new-cafes" class="my-4">
    <div
      class="my-4 w-full py-2 mx-auto flex flex-row gap-4 items-center justify-center bg-gray-200"
    >
      <div
        class="text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80"
      >
        Cafe Terbaru 1
      </div>
      <div
        class="text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80"
      >
        Cafe Terbaru 2
      </div>
      <div
        class="text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80"
      >
        Cafe Terbaru 3
      </div>
      <div
        class="text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80"
      >
        Cafe Terbaru 4
      </div>
    </div>
  </section>
  <section id="main-content" class="flex sm:px-4 sm:max-w-[98%] mx-auto">
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
        'md:translate-x-0 md:static md:w-[20%] md:max-w-[20%]': true,
      }"
      class="p-4 border border-gray-400"
      style="height: 100vh; overflow-y: auto"
    >
      <Sidebar
        :activeFilters="activeFilters"
        :cities="uniqueCities"
        :ratings="uniqueRatings"
        :ranges="uniquePriceRanges"
        :onNearbyToggle="toggleNearbyFilter"
        :isNearbyActive="isNearbyActive"
        :locationLoading="locationLoading"
      />
    </div>

    <div class="p-4 flex-1">
      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div
          v-for="n in itemsPerPage"
          :key="n"
          class="rounded-md flex flex-col h-full pb-4 border overflow-hidden"
        >
          <div class="skeleton skeleton-image"></div>
          <div class="flex-1 flex-col px-4">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
      </div>
      <div v-else>
        <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <li
            v-for="(cafe, index) in paginatedData"
            :key="index"
            class="rounded-md flex flex-col h-full pb-4 border overflow-hidden"
          >
            <NuxtLink :to="`/cafes/${cafe.id}`">
              <NuxtImg
                alt="Cafe Image"
                class="w-full h-48 object-cover mb-4"
                :src="cafe.photo"
                placeholder="/img/noimg.webp"
              />
              <div class="flex-1 flex-col px-4">
                <h2
                  class="text-lg text-gray-800 leading-tight line-clamp-2 font-semibold"
                >
                  {{ cafe.name }}
                </h2>
                <p class="text-sm text-gray-500 line-clamp-2 mt-2">
                  {{ cafe.description }}
                </p>
              </div>
              <div class="flex justify-between px-4 mt-8">
                <div class="flex items-center gap-1">
                  <img
                    src="/src/assets/img/city.svg"
                    alt="location"
                    class="h-3"
                  />
                  <p class="text-gray-500 text-xs">{{ cafe.city }}</p>
                </div>
                <div class="flex items-center gap-1 font-semibold">
                  <p class="text-gray-500 text-xs">{{ cafe.range }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <img
                    src="/src/assets/img/rating.svg"
                    alt="star"
                    class="h-3"
                  />
                  <p class="text-gray-500 text-xs">{{ cafe.rating }}</p>
                </div>
              </div>
            </NuxtLink>
          </li>
        </ul>
        <div class="flex justify-center mt-4 space-x-2">
          <span
            v-if="currentPage > 1"
            @click="changePage(currentPage - 1)"
            class="cursor-pointer text-blue-500 hover:underline"
          >
            Previous
          </span>
          <span
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            :class="{
              'font-bold text-blue-500': currentPage === page,
              'text-gray-700': currentPage !== page,
            }"
            class="cursor-pointer hover:underline"
          >
            {{ page }}
          </span>
          <span
            v-if="currentPage < totalPages"
            @click="changePage(currentPage + 1)"
            class="cursor-pointer text-blue-500 hover:underline"
          >
            Next
          </span>
          <span
            v-if="
              currentPage < totalPages && !visiblePages.includes(totalPages)
            "
            @click="changePage(totalPages)"
            class="cursor-pointer text-blue-500 hover:underline"
          >
            Last ({{ totalPages }})
          </span>
        </div>
      </div>
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

  /* ... existing styles ... */

  .skeleton {
    background-color: #e0e0e0;
    border-radius: 4px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }

  .skeleton-text {
    height: 1em;
    margin-bottom: 0.5em;
    width: 80%; /* Adjust width for better appearance */
  }

  .skeleton-image {
    height: 150px; /* Adjust height to match your design */
    width: 100%;
    margin-bottom: 1em;
  }
</style>
