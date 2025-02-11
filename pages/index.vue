<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4 text-center">Cafe's Directory</h1>
    <div class="flex justify-center mb-4">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search cafes..." 
        class="border rounded p-2 w-full max-w-md"
      />
    </div>
    <div v-if="loading" class="text-center text-gray-500">Loading data...</div>
    <div v-else>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <li v-for="(cafe, index) in paginatedData" :key="index" class="p-4 border rounded shadow">
          <NuxtImg alt="Cafe Image" class="w-full h-48 object-cover rounded mb-4" :src="cafe.photo" />
          <h2 class="text-xl font-semibold">{{ cafe.name }}</h2>
          <p class="text-gray-700">{{ cafe.description }}</p>
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
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'

const data = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 12
const searchQuery = ref('')

const filteredData = computed(() => {
  if (!searchQuery.value) {
    return data.value
  }
  return data.value.filter(cafe => 
    cafe.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    cafe.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
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