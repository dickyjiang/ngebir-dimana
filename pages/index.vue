<template>
  <section id="hero" class="my-4 px-4 h-[35svh] sm:h-[40svh]">
    <div
      class="container mx-auto lg:max-w-[90%] rounded-2xl overflow-clip relative flex items-center justify-center h-full"
    >
      <img
        class="object-cover object-center w-full h-full"
        src="/src/assets/img/hero.webp"
        alt="hero image"
      />
      <div class="absolute inset-0 bg-black opacity-55 z-[1]"></div>
      <div
        class="absolute z-[2] flex flex-col items-center justify-center w-[90%] sm:w-[80%] mx-auto h-full"
      >
        <h1
          class="text-2xl sm:text-5xl text-white text-center font-medium tracking-wide mb-2 sm:mb-4"
        >
          Ngopi di mana?
        </h1>
        <h2
          class="text-sm sm:text-xl tracking-wide text-white mb-2 sm:mb-4 text-center"
        >
          {{ totalCafes }} Cafe's Directory
        </h2>
        <div
          class="mt-2 sm:mt-4 w-full sm:w-1/2 flex flex-col gap-2 sm:gap-4 items-center justify-center px-4"
        >
          <div class="flex items-center gap-2 w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search cafes..."
              class="text-sm sm:text-base border w-full border-gray-600 rounded-lg p-2 sm:p-3 pr-8"
            />
            <button @click="performSearch" class="text-gray-500 -ml-10">
              <i class="fas fa-search"></i>
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
      <button
        @click="toggleNearbyFilter"
        :class="{
          'text-white bg-black': isNearbyActive,
          'text-gray-500 border border-gray-400': !isNearbyActive,
        }"
        class="px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
        style="-webkit-tap-highlight-color: transparent; touch-action: manipulation;"
        type="button"
        role="button"
      >
        <span
          v-if="locationLoading"
          class="inline-block w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
          :class="{
            'border-black': isNearbyActive,
            'border-black': !isNearbyActive,
          }"
        ></span>
        <span>Cafe terdekat</span>
      </button>
    </div>
  </section>
  <PopularCategories class="hidden" :categories="popularCategories" />
  <section id="main-content" class="flex sm:px-4 sm:max-w-[90%] mx-auto">
    <!-- Mobile Toggle Button -->
    <button
      @click="toggleSidebar"
      class="fixed bottom-4 right-4 z-50 md:hidden bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium"
    >
      {{ isSidebarOpen ? "Close" : "Filter" }}
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

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useNuxtApp } from "#app";
import Sidebar from "~/components/Sidebar.vue";
import PopularCategories from "~/components/PopularCategories.vue";
import "@fortawesome/fontawesome-free/css/all.css";
import { debounce } from "lodash";

const data = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 12;
const searchQuery = ref("");

// Add state for sidebar visibility
const isSidebarOpen = ref(false);

// Add state for user location and nearby filter
const userLocation = ref(null);
const locationLoading = ref(false);
const locationError = ref(null);
const isNearbyActive = ref(false);
const nearbyRadius = 10; // in kilometers

// Initialize activeFilters with all expected properties
const activeFilters = ref({ rating: [], range: [], city: [] });

function toggleFilter(type, value) {
  const index = activeFilters.value[type].indexOf(value);
  if (index > -1) {
    activeFilters.value[type].splice(index, 1);
  } else {
    activeFilters.value[type].push(value);
  }
}

// Debounced search function
const debouncedFetchBySearch = debounce((query, filters) => {
  currentPage.value = 1;
  fetchCafes(1, filters);
}, 500); // 500ms delay

// Change the fetchCafes function to include filter parameters
async function fetchCafes(page, filters = null) {
  // Use a cache key that represents the current filters and page

  loading.value = true;
  const { $supabase } = useNuxtApp();

  // Calculate range based on current page
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  try {
    // Start with a query builder
    let query = $supabase.from("cafes").select("*", { count: "exact" });

    // Apply filters if they exist
    if (filters) {
      // City filter
      if (filters.city && filters.city.length > 0) {
        query = query.in("city", filters.city);
        console.log(`Filtering by cities: ${filters.city.join(", ")}`);
      }

      // Rating filter - needs to handle the Math.round() issue
      if (filters.rating && filters.rating.length > 0) {
        if (filters.rating && filters.rating.length > 0) {
          query = query.or(
            filters.rating.map((rating) => `rating.like.${rating}%`).join(",")
          );
          console.log(`Filtering by ratings: ${filters.rating.join(", ")}`);
        }
      }

      // Price range filter
      if (filters.range && filters.range.length > 0) {
        query = query.in("range", filters.range);
        console.log(`Filtering by ranges: ${filters.range.join(", ")}`);
      }
    }

    // Apply search query if it exists
    if (searchQuery.value) {
      query = query.ilike("name", `%${searchQuery.value}%`);
      console.log(`Searching for: ${searchQuery.value}`);
    }

    // Finally apply pagination
    query = query.range(from, to);

    // Execute the query
    const { data: supabaseData, error, count } = await query;

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      console.log(
        `Fetched page ${page} with ${supabaseData.length} cafes (total: ${count})`
      );
      data.value = supabaseData;
      totalCafes.value = count || 0;
    }
  } catch (err) {
    console.error("Exception while fetching cafes:", err);
  } finally {
    loading.value = false;
  }

  // Add caching at the end of the fetch
}

// Update the watch functionality to apply filters
watch(
  () => [
    JSON.stringify(activeFilters.value.city),
    JSON.stringify(activeFilters.value.rating),
    JSON.stringify(activeFilters.value.range),
  ],
  () => {
    console.log("Filters changed");
    currentPage.value = 1;
    fetchCafes(1, activeFilters.value);
  }
);

// Also watch search query to trigger filtering
watch(searchQuery, (newQuery) => {
  console.log("Search query changed:", newQuery);
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
  const startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
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
  // Try to get filter options from cache first
  const { $supabase } = useNuxtApp();

  try {
    // Make a single call to get all filter data at once
    console.log("Fetching all filter options in a single query...");
    const [cityResponse, ratingsAndRangesResponse] = await Promise.all([
      // City data - separate call since it's from a different view
      $supabase.from("v_city").select("*"),

      // Get both ratings and price ranges in one call
      $supabase.from("cafes").select("rating, range"),
    ]);

    // Process cities
    if (cityResponse.error) {
      console.error("Error fetching cities:", cityResponse.error);
    } else if (cityResponse.data && cityResponse.data.length > 0) {
      const cityField = "city" in cityResponse.data[0] ? "city" : "name";
      uniqueCities.value = cityResponse.data
        .map((item) => item[cityField]?.trim())
        .filter(Boolean)
        .sort();
    }

    // Process ratings and price ranges from the single response
    if (ratingsAndRangesResponse.error) {
      console.error(
        "Error fetching ratings and ranges:",
        ratingsAndRangesResponse.error
      );
    } else {
      // Extract unique ratings
      uniqueRatings.value = [
        ...new Set(
          ratingsAndRangesResponse.data
            .map((item) => Math.round(item.rating))
            .filter((rating) => !isNaN(rating))
        ),
      ].sort((a, b) => a - b);

      // Extract unique price ranges
      uniquePriceRanges.value = [
        ...new Set(
          ratingsAndRangesResponse.data
            .map((item) => item.range)
            .filter((range) => range && range.trim() !== "")
        ),
      ].sort();
    }
  } catch (err) {
    console.error("Exception fetching filter options:", err);
    // ... your existing error handling ...
  }
}

function performSearch() {
  console.log("Performing search with query:", searchQuery.value);
}

// Extract popular categories from the about field
const popularCategories = computed(() => {
  const categories = new Set();
  data.value.forEach((cafe) => {
    if (cafe.about) {
      const about =
        typeof cafe.about === "string" ? JSON.parse(cafe.about) : cafe.about;
      Object.keys(about).forEach((key) => {
        if (typeof about[key] === "object") {
          Object.keys(about[key]).forEach((subKey) => {
            if (about[key][subKey]) {
              categories.add(subKey);
            }
          });
        }
      });
    }
  });
  return Array.from(categories);
});

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchCafes(page, activeFilters.value); // Pass the current filters when changing page
  }
}

// Get user location
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
      console.warn("Geolocation is not supported by your browser");
      locationError.value = "Geolocation is not supported by your browser";
      throw new Error("Geolocation not supported");
    }

    // Get current position with a shorter timeout
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 5000, // 5 seconds timeout
        maximumAge: 60000, // Allow cached positions up to 1 minute old
      });
    });

    userLocation.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    console.log("User location:", userLocation.value);
    return userLocation.value;
  } catch (error) {
    console.error("Error getting user location:", error);
    locationError.value = error.message || "Unable to get your location";
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

// Toggle nearby filter
async function toggleNearbyFilter() {
  try {
    if (isNearbyActive.value) {
      // If already active, deactivate it
      isNearbyActive.value = false;
      // Clear any city filters that might have been set
      activeFilters.value.city = [];
      // Fetch all cafes
      fetchCafes(1, activeFilters.value);
      return;
    }

    // Get user location
    await getUserLocation();

    if (!userLocation.value) {
      console.error("No user location available");
      return;
    }

    // Activate nearby filter
    isNearbyActive.value = true;

    // Fetch cafes with location data to calculate distances
    await fetchCafesWithLocation();
  } catch (error) {
    console.error("Error toggling nearby filter:", error);
    isNearbyActive.value = false;
  }
}

// Fetch cafes with location data to calculate distances
async function fetchCafesWithLocation() {
  loading.value = true;
  const { $supabase } = useNuxtApp();

  try {
    // Fetch all cafes with latitude and longitude
    const { data: cafesWithLocation, error } = await $supabase
      .from("cafes")
      .select("id, latitude, longitude, city")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) {
      console.error("Error fetching cafes with location:", error);
      return;
    }

    if (!cafesWithLocation || cafesWithLocation.length === 0) {
      console.warn("No cafes with location data found");
      return;
    }

    console.log(`Found ${cafesWithLocation.length} cafes with location data`);

    // Calculate distances
    const nearbyCities = new Set();

    cafesWithLocation.forEach((cafe) => {
      if (cafe.latitude && cafe.longitude && cafe.city) {
        const distance = calculateDistance(
          userLocation.value.latitude,
          userLocation.value.longitude,
          cafe.latitude,
          cafe.longitude
        );

        // If within radius, add the city to our set
        if (distance <= nearbyRadius) {
          nearbyCities.add(cafe.city);
        }
      }
    });

    console.log(
      `Found ${nearbyCities.size} nearby cities:`,
      Array.from(nearbyCities)
    );

    // Update city filters to include only nearby cities
    activeFilters.value.city = Array.from(nearbyCities);

    // Fetch cafes with the updated city filters
    fetchCafes(1, activeFilters.value);
  } catch (err) {
    console.error("Error in fetchCafesWithLocation:", err);
  } finally {
    loading.value = false;
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
  fetchCafes(currentPage.value);
});
</script>

<script>
export default {
  layout: "default",
};
</script>

<style scoped>
@font-face {
  font-family: "Sharp Grotesk";
  src: url("~/assets/fonts/sharp-grotesk-medium-25-regular.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}

h1 {
  font-family: "Sharp Grotesk", sans-serif; /* Fallback to sans-serif */
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

/* Fix for iOS touch events */
button {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
</style>
