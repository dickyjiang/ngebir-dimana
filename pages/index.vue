<template>
  <section class="relative h-[60svh] flex items-center justify-center">
    <div class="absolute inset-0 w-full h-full">
      <img
        class="object-cover object-center w-full h-full"
        src="/src/assets/img/hero.webp"
        alt="hero image"
      />
      <div class="absolute inset-0 bg-black opacity-55 z-10"></div>
    </div>
    <div class="z-20">
      <h1 class="text-6xl text-white text-center font-medium tracking-wide mb-3">Ngopi Dimana?</h1>
      <h2 class="text-3xl text-white mb-4 text-center">Cafe's Directory</h2>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search cafes..." 
        class="border w-full max-w-md border-gray-600 rounded-lg p-3"
      />
    </div>
  </section>
  <div class="container mx-auto p-4">
    
    <div class="flex flex-col items-center mx-auto  w-full  justify-center mb-4 py-4">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search cafes..." 
        class="border w-full max-w-md border-gray-600 rounded-lg p-3"
      />
      <div class="max-w-[80%] flex flex-wrap gap-2 text-xs text-nowrap my-8">
        <button 
          v-for="rating in uniqueRatings" 
          :key="rating" 
          @click="toggleFilter('rating', rating)" 
          :class="{'bg-blue-500 text-white': activeFilters.rating.includes(rating), 'bg-none border border-gray-400': !activeFilters.rating.includes(rating)}"
          class="px-3 py-2 rounded-full">
          {{ rating }} Stars
        </button>
        <button 
          v-for="city in uniqueCities" 
          :key="city" 
          @click="toggleFilter('city', city)" 
          :class="{'bg-blue-500 text-white': activeFilters.city.includes(city), 'bg-gray-200': !activeFilters.city.includes(city)}"
          class="px-4 py-2 rounded-full">
          {{ city }}
        </button>
      </div>
    </div>
    <div v-if="loading" class="text-center text-gray-500">Loading data...</div>
    <div v-else>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <li v-for="(cafe, index) in paginatedData" :key="index" class="border rounded shadow flex flex-col h-full pb-4">

            <NuxtImg alt="Cafe Image" class="w-full h-48 object-cover rounded-xl mb-4" :src="cafe.photo" />
            <div class="flex-1 flex-col px-4">
              <h2 class="text-xl font-semibold">{{ cafe.name }}</h2>
              <p class="text-gray-500 line-clamp-2">{{ cafe.description }}</p>
            </div>
            <div class="flex justify-between px-4 mt-8">
              <button class="text-sm text-gray-500 border border-gray-400 px-4 py-2 rounded-full">{{ cafe.city }}</button>
              <div class="flex items-center gap-1">
                <img src="/src/assets/img/rating.svg" alt="star" class="w-4 h-4">
                <p class="text-gray-500 line-clamp-2">{{ cafe.rating }}</p>
              </div>
            </div>


          <!-- Add more fields as needed -->
        </li>
      </ul>
      <div class="flex justify-center mt-4 space-x-2">
        <span 
          v-if="currentPage > 1" 
          @click="currentPage--" 
          class="cursor-pointer text-blue-500 hover:underline">
          Previous
        </span>
        <span 
          v-for="page in visiblePages" 
          :key="page" 
          @click="currentPage = page" 
          :class="{'font-bold text-blue-500': currentPage === page, 'text-gray-700': currentPage !== page}"
          class="cursor-pointer hover:underline">
          {{ page }}
        </span>
        <span 
          v-if="currentPage < totalPages" 
          @click="currentPage++" 
          class="cursor-pointer text-blue-500 hover:underline">
          Next
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useNuxtApp } from '#app'

const data = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 12
const searchQuery = ref('')

const uniqueRatings = ref([1, 2, 3, 4, 5]) // Example data
const activeFilters = ref({ rating: [], city: [] })

function toggleFilter(type, value) {
  const index = activeFilters.value[type].indexOf(value)
  if (index > -1) {
    activeFilters.value[type].splice(index, 1)
  } else {
    activeFilters.value[type].push(value)
  }
}

console.log('Unique Ratings:', uniqueRatings.value)

const uniqueCities = computed(() => {
  const cities = data.value.map(cafe => cafe.city)
  return [...new Set(cities)]
})

const filteredData = computed(() => {
  return data.value.filter(cafe => {
    return cafe.name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
})

// Debugging: Log search query and filtered results
watch(searchQuery, (newQuery) => {
  console.log('Search Query:', newQuery)
  console.log('Filtered Data:', filteredData.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredData.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage)
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

onMounted(async () => {
  const { $supabase } = useNuxtApp()
  const { data: supabaseData, error } = await $supabase
    .from('cafes')
    .select('*')

  if (error) {
    console.error('Error fetching data:', error)
  } else {
    data.value = supabaseData
    console.log('Cafe photos:', data.value.map(cafe => cafe.photo))
  }
  loading.value = false
})
</script> 