<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="text-center text-gray-500">Loading cafe details...</div>
    <div v-else-if="cafe">
      <div class="flex items-center justify-between">
        <div class="w-1/2">
          <h1 class="text-4xl font-bold mb-4">{{ cafe.name }}</h1>
          <NuxtImg :src="cafe.photo" alt="Cafe Image" class="w-full h-64 object-cover mb-4" />
          <p class="text-lg text-gray-700 mb-2">{{ cafe.description }}</p>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">City: {{ cafe.city }}</span>
            <span class="text-sm text-gray-500">Rating: {{ cafe.rating }}</span>
            <span class="text-sm text-gray-500">Price Range: {{ cafe.range }}</span>
          </div>
        </div>
        <div>

        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500">Cafe not found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useNuxtApp } from '#app'

const route = useRoute()
const cafe = ref(null)
const loading = ref(true)

onMounted(async () => {
  console.log('Route ID:', route.params.id)
  const { $supabase } = useNuxtApp()
  const { data: cafeData, error } = await $supabase
    .from('cafes')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (error) {
    console.error('Error fetching cafe details:', error)
  } else {
    console.log('Fetched Cafe Data:', cafeData)
    cafe.value = cafeData
  }
  loading.value = false
})
</script> 