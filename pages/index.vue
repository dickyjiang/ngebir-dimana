<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Cafe's Directory</h1>
    <div v-if="loading" class="text-center text-gray-500">Loading data...</div>
    <div v-else>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <li v-for="(cafe, index) in data" :key="index" class="p-4 border rounded shadow">
          <NuxtImg alt="Cafe Image" class="w-full h-48 object-cover rounded mb-4" :src="cafe.photo" />
          <h2 class="text-xl font-semibold">{{ cafe.name }}</h2>
          <p class="text-gray-700">{{ cafe.description }}</p>
          <!-- Add more fields as needed -->
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

const data = ref([])
const loading = ref(true)

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