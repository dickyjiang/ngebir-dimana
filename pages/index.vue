<template>
  <div>
    <h1>Cafe's Directory</h1>
    <div v-if="loading">Loading data...</div>
    <div v-else>
      <ul>
        <li v-for="(cafe, index) in data" :key="index">
          <h2>{{ cafe.name }}</h2>
          <p>{{ cafe.description }}</p>
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
  }
  loading.value = false
})
</script> 