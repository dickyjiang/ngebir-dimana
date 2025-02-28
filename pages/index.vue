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

const filteredData = computed(() => {
  return data.value.filter(cafe => {
    const matchesSearch = cafe.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRating = activeFilters.value.rating.length === 0 || activeFilters.value.rating.includes(Math.round(cafe.rating))
    const matchesRange = activeFilters.value.range.length === 0 || activeFilters.value.range.includes(cafe.range)
    const matchesCity = activeFilters.value.city.length === 0 || activeFilters.value.city.includes(cafe.city)
    return matchesSearch && matchesRating && matchesRange && matchesCity
  })
})

watch(searchQuery, (newQuery) => {
  console.log('Search Query:', newQuery)
  console.log('Filtered Data:', filteredData.value)
})

const paginatedData = computed(() => {
  return filteredData.value
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

// Fetch filter options with improved city handling
async function fetchFilterOptions() {
  const { $supabase } = useNuxtApp()
  
  try {
    // FIRST APPROACH: Get ALL cities from the database - no filtering initially
    console.log("Fetching all cities from database...")
    const { data: cityData, error: cityError } = await $supabase
      .from('cafes')
      .select('city')
    
    if (cityError) {
      console.error('Error fetching cities:', cityError)
    } else {
      console.log(`Retrieved ${cityData.length} total city records`)
      
      // Log raw city data to see what's actually in the database
      console.log("Raw city values from database:")
      cityData.forEach(item => {
        console.log(`City: "${item.city}"`)
      })
      
      // Check if Central Jakarta exists in original data
      const hasCentralJakarta = cityData.some(item => 
        item.city === 'Central Jakarta' || 
        item.city?.toLowerCase().includes('central jakarta') ||
        item.city?.toLowerCase().includes('jakarta pusat')
      )
      console.log("Does database have Central Jakarta?", hasCentralJakarta)
      
      // Process cities to get unique values
      const processedCities = cityData
        .map(item => item.city)
        .filter(city => city && city.trim()) // Remove null/empty
        .map(city => city.trim()) // Trim whitespace
      
      console.log(`After filtering nulls: ${processedCities.length} cities`)
      
      // Get unique cities (case-sensitive)
      uniqueCities.value = [...new Set(processedCities)].sort()
      console.log(`Found ${uniqueCities.value.length} unique cities after deduplication`)
      console.log("Unique cities before adding Jakarta regions:", JSON.stringify(uniqueCities.value))
      
      // IMPORTANT: Add Jakarta regions explicitly
      const jakartaRegions = [
        'North Jakarta', 'Jakarta Utara',
        'South Jakarta', 'Jakarta Selatan',
        'East Jakarta', 'Jakarta Timur',
        'West Jakarta', 'Jakarta Barat',
        'Central Jakarta', 'Jakarta Pusat'
      ]
      
      // Add all Jakarta regions to ensure they're included
      jakartaRegions.forEach(region => {
        if (!uniqueCities.value.includes(region)) {
          uniqueCities.value.push(region)
          console.log(`Added missing city: ${region}`)
        }
      })
      
      // Sort again after additions
      uniqueCities.value.sort()
      console.log(`Final city list has ${uniqueCities.value.length} cities`)
      console.log("Final city list:", JSON.stringify(uniqueCities.value))
    }
    
    // Fetch ratings
    const { data: ratingData, error: ratingError } = await $supabase
      .from('cafes')
      .select('rating')
    
    if (ratingError) {
      console.error('Error fetching ratings:', ratingError)
    } else {
      // Extract unique ratings and round them
      uniqueRatings.value = [...new Set(ratingData.map(item => Math.round(item.rating)))].sort((a, b) => a - b)
      console.log(`Fetched ${uniqueRatings.value.length} unique ratings`)
    }
    
    // Fetch price ranges
    const { data: rangeData, error: rangeError } = await $supabase
      .from('cafes')
      .select('range')
    
    if (rangeError) {
      console.error('Error fetching price ranges:', rangeError)
    } else {
      // Extract unique price ranges
      uniquePriceRanges.value = [...new Set(rangeData.map(item => item.range))].sort()
      console.log(`Fetched ${uniquePriceRanges.value.length} unique price ranges`)
    }
  } catch (err) {
    console.error('Exception fetching filter options:', err)
    
    // Emergency fallback if everything fails
    uniqueCities.value = [
      'Jakarta', 'North Jakarta', 'South Jakarta', 'East Jakarta', 
      'West Jakarta', 'Central Jakarta', 'Bandung', 'Surabaya', 
      'Yogyakarta', 'Bali', 'Medan', 'Makassar', 'Semarang'
    ]
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

async function fetchCafes(page) {
  loading.value = true
  const { $supabase } = useNuxtApp()
  
  // Calculate range based on current page
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  try {
    // Use cafes table as requested
    const { data: supabaseData, error, count } = await $supabase
      .from('cafes')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (error) {
      console.error('Error fetching data:', error)
    } else {
      console.log(`Fetched page ${page} with ${supabaseData.length} cafes`)
      data.value = supabaseData
      totalCafes.value = count
    }
  } catch (err) {
    console.error('Exception while fetching cafes:', err)
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchCafes(page)
  }
}

onMounted(async () => {
  // Fetch city options for filters first
  await fetchFilterOptions()
  // Then fetch cafe data for the current page
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