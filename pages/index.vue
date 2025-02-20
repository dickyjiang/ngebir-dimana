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
  <section id="popular-categories">
    <div class="container mx-auto py-4">
      <h2 class="text-center text-2xl font-bold">
        Popular Categories
      </h2> 
      <div class="flex items-center justify-center flex-wrap gap-4 py-4">
        <div v-for="category in popularCategories" :key="category" class="bg-gray-200 px-4 py-2 rounded-full text-sm">
          {{ category }}
        </div>
      </div>
    </div>
  </section>
  <section id="main-content" class="flex sm:px-4">
    <div class="sticky top-0 w-full max-w-[20%] p-4 border-r border-gray-400 hidden md:block" style="height: 100vh; overflow-y: auto;">
      <Sidebar :activeFilters="activeFilters" :cities="uniqueCities" />
    </div>
    <div class="p-4">
      <div v-if="loading" class="text-center text-gray-500">Loading data...</div>
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

function handleImageError(event) {
  event.target.src = '/src/assets/img/noImage_placeholder.webp' // Set a default image
  console.error('Image failed to load:', event.target.src)
}

function performSearch() {
  console.log('Performing search with query:', searchQuery.value)
}

// Extract unique cities
const uniqueCities = computed(() => {
  return [...new Set(data.value.map(cafe => cafe.city))]
})

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
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data: supabaseData, error, count } = await $supabase
    .from('cafes')
    .select('*', { count: 'exact' })
    .range(from, to)

  if (error) {
    console.error('Error fetching data:', error)
  } else {
    data.value = supabaseData
    totalCafes.value = count
  }
  loading.value = false
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchCafes(page)
  }
}

onMounted(() => {
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
</style>