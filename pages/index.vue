<template>
  <section id="hero" class="my-4">
    <div class="container mx-auto rounded-2xl overflow-clip relative flex items-center justify-center">
      <img class="object-cover object-center w-full max-h-96" src="/src/assets/img/hero.webp" alt="hero image" />
      <div class="absolute inset-0 bg-black opacity-55 z-10"></div>
      <div class="absolute z-20 flex flex-col items-center justify-center w-[80%] mx-auto h-full">
        <h1 class="text-6xl text-white text-center font-medium tracking-wide mb-3">Ngopi Dimana?</h1>
        <h2 class="text-3xl text-white mb-4 text-center">Cafe's Directory</h2>
        <div class="mt-4 w-full flex flex-col gap-4 items-center justify-center">
          <div class="flex items-center gap-2 w-full max-w-lg">
            <input v-model="searchQuery" type="text" placeholder="Search cafes..."
              class="border w-full max-w-md border-gray-600 rounded-lg p-3" />
            <button class="border border-gray-200 text-white px-7 py-3 rounded-lg">Search</button>
          </div>
          <div class="flex items-center gap-2">
            <button class="border border-gray-200 text-white px-7 py-3 rounded-lg">Filter</button>
            <button class="border border-gray-200 text-white px-7 py-3 rounded-lg">Sort</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section id="main-content" class="flex px-16">
    <div class="sticky top-0 w-full max-w-[20%] p-4 border-r-4 border-gray-800" style="height: 100vh; overflow-y: auto;">
      <Sidebar />
    </div>
    <div class="p-4">
      <div v-if="loading" class="text-center text-gray-500">Loading data...</div>
      <div v-else>
        <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <li v-for="(cafe, index) in paginatedData" :key="index"
            class=" rounded-md flex flex-col h-full pb-4 border overflow-hidden">
            <NuxtImg alt="Cafe Image" class="w-full h-48 object-cover  mb-4" :src="cafe.photo"
              @error="handleImageError" />
            <div class="flex-1 flex-col px-4">
              <h2 class="text-lg text-gray-800 leading-tight line-clamp-2 font-semibold">{{ cafe.name }}</h2>
              <p class="text-sm text-gray-500 line-clamp-2 mt-2">{{ cafe.description }}</p>
            </div>
            <div class="flex justify-between px-4 mt-8">
              <button class="text-xs text-gray-500 border border-gray-400 px-3 py-1 rounded-full">{{ cafe.city
                }}</button>
              <div class="flex items-center gap-1">
                <img src="/src/assets/img/rating.svg" alt="star" class="h-3">
                <p class="text-gray-500 text-xs">{{ cafe.rating }}</p>
              </div>
            </div>


            <!-- Add more fields as needed -->
          </li>
        </ul>
        <div class="flex justify-center mt-4 space-x-2">
          <span v-if="currentPage > 1" @click="currentPage--" class="cursor-pointer text-blue-500 hover:underline">
            Previous
          </span>
          <span v-for="page in visiblePages" :key="page" @click="currentPage = page"
            :class="{ 'font-bold text-blue-500': currentPage === page, 'text-gray-700': currentPage !== page }"
            class="cursor-pointer hover:underline">
            {{ page }}
          </span>
          <span v-if="currentPage < totalPages" @click="currentPage++"
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
import Navbar from '~/components/Navbar.vue'
import Sidebar from '~/components/Sidebar.vue'

const data = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 12
const searchQuery = ref('')

const uniqueRatings = ref([1, 2, 3, 4, 5]) // Example data
const uniqueRanges = ref(['$', '$$', '$$$', '$$$$']) // Example data
const activeFilters = ref({ rating: [], city: [], range: [] })

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

<script>
export default {
  layout: 'default'
}
</script>