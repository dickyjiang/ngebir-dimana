<template>
  <section id="hero" class="my-4 px-4 h-[25svh] sm:h-[40svh]">
    <div class="container mx-auto rounded-2xl overflow-clip relative flex items-center justify-center h-full">
      <img class="object-cover object-center w-full h-full" src="/src/assets/img/hero.webp" alt="hero image" />
      <div class="absolute inset-0 bg-black opacity-55 z-10"></div>
      <div class="absolute z-20 flex flex-col items-center justify-center w-[80%] mx-auto h-full">
        <h1 class="text-3xl sm:text-5xl text-white text-center font-medium tracking-wide mb-4">Ngopi di mana?</h1>
        <h2 class="text-md sm:text-xl tracking-wide text-white mb-4 text-center">{{ totalCafes }} Cafe's Directory</h2>
        <div class="mt-4 w-full flex flex-col gap-4 items-center justify-center">
          <div class="flex items-center gap-2 w-full max-w-lg">
            <input v-model="searchQuery" type="text" placeholder="Search cafes..."
              class="text-sm sm:text-base border w-full max-w-md border-gray-600 rounded-lg p-2 sm:p-3 pr-10" />
            <div class="relative">
              <button @click="performSearch" class="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <PopularCategories class="hidden" :categories="popularCategories" />
  <section id="main-content" class="flex sm:px-4">
    <div class="sticky top-4 w-full max-w-[20%] p-4 border border-gray-400 hidden md:block" style="height: 100vh; overflow-y: auto;">
      <Sidebar 
        :activeFilters="activeFilters" 
        :cities="uniqueCities"
        :ratings="uniqueRatings"
        :ranges="uniquePriceRanges"
      />
    </div>
    <div class="p-4 flex-1">
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="n in itemsPerPage" :key="n" class="rounded-md flex flex-col h-full pb-4 border overflow-hidden">
          <div class="skeleton skeleton-image"></div>
          <div class="flex-1 flex-col px-4">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
      </div>
      <div v-else>
        <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <li v-for="(cafe, index) in paginatedData" :key="index"
            class="rounded-md flex flex-col h-full pb-4 border overflow-hidden">
            <NuxtLink :to="`/cafes/${cafe.id}`">
              <NuxtImg alt="Cafe Image" class="w-full h-48 object-cover mb-4" :src="cafe.photo"
                @error="handleImageError" />
              <div class="flex-1 flex-col px-4">
                <h2 class="text-lg text-gray-800 leading-tight line-clamp-2 font-semibold">{{ cafe.name }}</h2>
                <p class="text-sm text-gray-500 line-clamp-2 mt-2">{{ cafe.description }}</p>
              </div>
              <div class="flex justify-between px-4 mt-8">
                <div class="flex items-center gap-1">
                  <img src="/src/assets/img/city.svg" alt="location" class="h-3">
                  <p class="text-gray-500 text-xs">{{ cafe.city }}</p>
                </div>
                <div class="flex items-center gap-1 font-semibold">
                  <p class="text-gray-500 text-xs">{{ cafe.range }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <img src="/src/assets/img/rating.svg" alt="star" class="h-3">
                  <p class="text-gray-500 text-xs">{{ cafe.rating }}</p>
                </div>
              </div>
            </NuxtLink>
          </li>
        </ul>
        <div class="flex justify-center mt-4 space-x-2">
          <span v-if="currentPage > 1" @click="changePage(currentPage - 1)" class="cursor-pointer text-blue-500 hover:underline">
            Previous
          </span>
          <span v-for="page in visiblePages" :key="page" @click="changePage(page)"
            :class="{ 'font-bold text-blue-500': currentPage === page, 'text-gray-700': currentPage !== page }"
            class="cursor-pointer hover:underline">
            {{ page }}
          </span>
          <span v-if="currentPage < totalPages" @click="changePage(currentPage + 1)"
            class="cursor-pointer text-blue-500 hover:underline">
            Next
          </span>
          <span v-if="currentPage < totalPages && !visiblePages.includes(totalPages)" 
            @click="changePage(totalPages)" 
            class="cursor-pointer text-blue-500 hover:underline">
            Last ({{ totalPages }})
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useNuxtApp } from '#app'
import Sidebar from '~/components/Sidebar.vue'
import PopularCategories from '~/components/PopularCategories.vue'
import '@fortawesome/fontawesome-free/css/all.css'
import { debounce } from 'lodash'

const data = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 12
const searchQuery = ref('')

// Initialize activeFilters with all expected properties
const activeFilters = ref({ rating: [], range: [], city: [] })

function toggleFilter(type, value) {
  const index = activeFilters.value[type].indexOf(value)
  if (index > -1) {
    activeFilters.value[type].splice(index, 1)
  } else {
    activeFilters.value[type].push(value)
  }
}

// Add caching for filter data
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

// Function to check if cache is valid
function isCacheValid(timestamp) {
  return timestamp && (Date.now() - timestamp < CACHE_DURATION);
}

// Function to save data to localStorage with timestamp
function saveToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Error saving to cache:', e);
  }
}

// Function to get data from cache
function getFromCache(key) {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (isCacheValid(timestamp)) {
        return data;
      }
    }
  } catch (e) {
    console.error('Error reading from cache:', e);
  }
  return null;
}

// Debounced search function
const debouncedFetchBySearch = debounce((query, filters) => {
  currentPage.value = 1;
  fetchCafes(1, filters);
}, 500); // 500ms delay

// Change the fetchCafes function to include filter parameters
async function fetchCafes(page, filters = null) {
  // Use a cache key that represents the current filters and page
  const cacheKey = `cafes_${page}_${JSON.stringify(filters)}_${searchQuery.value}`;
  const cachedData = getFromCache(cacheKey);
  
  if (cachedData) {
    console.log(`Using cached data for page ${page}`);
    data.value = cachedData.data;
    totalCafes.value = cachedData.totalCafes;
    loading.value = false;
    return;
  }
  
  loading.value = true
  const { $supabase } = useNuxtApp()
  
  // Calculate range based on current page
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  try {
    // Start with a query builder
    let query = $supabase
      .from('cafes')
      .select('*', { count: 'exact' })
    
    // Apply filters if they exist
    if (filters) {
      // City filter
      if (filters.city && filters.city.length > 0) {
        query = query.in('city', filters.city)
        console.log(`Filtering by cities: ${filters.city.join(', ')}`)
      }
      
      // Rating filter - needs to handle the Math.round() issue
      if (filters.rating && filters.rating.length > 0) {
        // For ratings, we need a more complex filter because we're rounding in the UI
        // This is a simplified approach - ideally use a between range for each rating
        const minRating = Math.min(...filters.rating) - 0.5
        const maxRating = Math.max(...filters.rating) + 0.49
        query = query.gte('rating', minRating).lte('rating', maxRating)
        console.log(`Filtering by ratings between ${minRating} and ${maxRating}`)
      }
      
      // Price range filter
      if (filters.range && filters.range.length > 0) {
        query = query.in('range', filters.range)
        console.log(`Filtering by ranges: ${filters.range.join(', ')}`)
      }
    }
    
    // Apply search query if it exists
    if (searchQuery.value) {
      query = query.ilike('name', `%${searchQuery.value}%`)
      console.log(`Searching for: ${searchQuery.value}`)
    }
    
    // Finally apply pagination
    query = query.range(from, to)
    
    // Execute the query
    const { data: supabaseData, error, count } = await query
    
    if (error) {
      console.error('Error fetching data:', error)
    } else {
      console.log(`Fetched page ${page} with ${supabaseData.length} cafes (total: ${count})`)
      data.value = supabaseData
      totalCafes.value = count || 0
    }
  } catch (err) {
    console.error('Exception while fetching cafes:', err)
  } finally {
    loading.value = false
  }

  // Add caching at the end of the fetch
  if (data.value && !error) {
    saveToCache(cacheKey, {
      data: data.value,
      totalCafes: totalCafes.value
    });
  }
}

// Update the watch functionality to apply filters
watch(
  () => [
    JSON.stringify(activeFilters.value.city),
    JSON.stringify(activeFilters.value.rating),
    JSON.stringify(activeFilters.value.range)
  ],
  () => {
    console.log('Filters changed');
    currentPage.value = 1; 
    fetchCafes(1, activeFilters.value);
  }
)

// Also watch search query to trigger filtering
watch(searchQuery, (newQuery) => {
  console.log('Search query changed:', newQuery);
  debouncedFetchBySearch(newQuery, activeFilters.value);
})

// Remove the filteredData computed property since we're now filtering in the database
// Instead, use data directly
const paginatedData = computed(() => {
  return data.value
})

const totalPages = computed(() => {
  return Math.ceil(totalCafes.value / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages.value, startPage + maxVisible - 1)

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

// Add a computed property to calculate the total number of cafes
const totalCafes = ref(0)

// Initialize filter options with empty arrays
const uniqueCities = ref([])
const uniqueRatings = ref([])
const uniquePriceRanges = ref([])

// Modify fetchFilterOptions to use caching
async function fetchFilterOptions() {
  // Try to get filter options from cache first
  const cachedFilters = getFromCache('cafeFilterOptions');
  if (cachedFilters) {
    console.log('Using cached filter options');
    uniqueCities.value = cachedFilters.cities || [];
    uniqueRatings.value = cachedFilters.ratings || [];
    uniquePriceRanges.value = cachedFilters.ranges || [];
    return;
  }

  const { $supabase } = useNuxtApp();
  
  try {
    // Make a single call to get all filter data at once
    console.log('Fetching all filter options in a single query...');
    const [cityResponse, ratingsAndRangesResponse] = await Promise.all([
      // City data - separate call since it's from a different view
      $supabase.from('v_city').select('*'),
      
      // Get both ratings and price ranges in one call
      $supabase.from('cafes').select('rating, range')
    ]);
    
    // Process cities
    if (cityResponse.error) {
      console.error('Error fetching cities:', cityResponse.error);
    } else if (cityResponse.data && cityResponse.data.length > 0) {
      const cityField = 'city' in cityResponse.data[0] ? 'city' : 'name';
      uniqueCities.value = cityResponse.data
        .map(item => item[cityField]?.trim())
        .filter(Boolean)
        .sort();
    }
    
    // Process ratings and price ranges from the single response
    if (ratingsAndRangesResponse.error) {
      console.error('Error fetching ratings and ranges:', ratingsAndRangesResponse.error);
    } else {
      // Extract unique ratings
      uniqueRatings.value = [...new Set(ratingsAndRangesResponse.data
        .map(item => Math.round(item.rating))
        .filter(rating => !isNaN(rating))
      )].sort((a, b) => a - b);
      
      // Extract unique price ranges
      uniquePriceRanges.value = [...new Set(ratingsAndRangesResponse.data
        .map(item => item.range)
        .filter(range => range && range.trim() !== '')
      )].sort();
    }
    
    // Cache the filter options
    saveToCache('cafeFilterOptions', {
      cities: uniqueCities.value,
      ratings: uniqueRatings.value,
      ranges: uniquePriceRanges.value
    });
    
  } catch (err) {
    console.error('Exception fetching filter options:', err);
    // ... your existing error handling ...
  }
}

function handleImageError(event) {
  event.target.src = '/src/assets/img/noImage_placeholder.webp' // Set a default image
  console.error('Image failed to load:', event.target.src)
}

function performSearch() {
  console.log('Performing search with query:', searchQuery.value)
}

// Extract popular categories from the about field
const popularCategories = computed(() => {
  const categories = new Set()
  data.value.forEach(cafe => {
    if (cafe.about) {
      const about = typeof cafe.about === 'string' ? JSON.parse(cafe.about) : cafe.about
      Object.keys(about).forEach(key => {
        if (typeof about[key] === 'object') {
          Object.keys(about[key]).forEach(subKey => {
            if (about[key][subKey]) {
              categories.add(subKey)
            }
          })
        }
      })
    }
  })
  return Array.from(categories)
})

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchCafes(page, activeFilters.value) // Pass the current filters when changing page
  }
}

onMounted(async () => {
  // Fetch city options for filters first
  await fetchFilterOptions()
  // Then fetch cafe data for the current page (no filters initially)
  fetchCafes(currentPage.value)
})
</script>

<script>
export default {
  layout: 'default'
}
</script>

<style scoped>
@font-face {
  font-family: 'Sharp Grotesk';
  src: url('~assets/fonts/sharp-grotesk-medium-25-regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

h1 {
  font-family: 'Sharp Grotesk', sans-serif; /* Fallback to sans-serif */
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