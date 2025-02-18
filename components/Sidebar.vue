<template>
    <aside>
      <div class="w-full pb-2 border-b border-gray-400 mb-4">
        <h2 class="text-lg font-medium">Filter</h2>
      </div>
      <div class="mb-8">
        <h3 class="text-sm font-medium">Rating</h3>
        <div class="flex flex-wrap gap-2 text-xs text-nowrap my-4">
          <button v-for="rating in uniqueRatings" :key="rating" @click="toggleFilter('rating', rating)"
            :class="{ 'bg-gray-800 text-white': activeFilters.rating.includes(rating), 'bg-none border border-gray-400': !activeFilters.rating.includes(rating) }"
            class="px-3 py-2 rounded-full">
            {{ rating }} Stars
          </button>
        </div>
      </div>
      <div class="mb-8">
        <h3 class="text-sm font-medium">Price Range</h3>
        <div class="flex flex-wrap gap-2 text-xs text-nowrap my-4">
          <button v-for="range in uniqueRanges" :key="range" @click="toggleFilter('range', range)"
            :class="{ 'bg-gray-800 text-white w-14': activeFilters.range.includes(range), 'bg-none border border-gray-400 w-14': !activeFilters.range.includes(range) }"
            class="px-3 py-2 rounded-full">
            {{ range }}
          </button>
        </div>
      </div>
  
      <div class="w-full pb-2 border-b border-gray-400">
        <h2 class="text-lg font-medium">Lokasi</h2>
      </div>
      <div class="flex flex-wrap gap-3 text-sm text-gray-500 text-nowrap my-4">
        <button v-for="city in uniqueCities" :key="city" @click="toggleFilter('city', city)"
          :class="{ 'bg-gray-800 text-white': activeFilters.city.includes(city), 'bg-gray-100': !activeFilters.city.includes(city) }"
          class="px-3 py-1 rounded-full">
          {{ city }}
        </button>
      </div>
    </aside>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  
  const props = defineProps({
    activeFilters: Object,
    cities: Array // Ensure this is declared
  })
  
  onMounted(() => {
    if (props.cities) {
      console.log('Cities prop:', props.cities) // This should log the cities array
    } else {
      console.error('Cities prop is undefined')
    }
  })
  
  const uniqueRatings = ref([1, 2, 3, 4, 5]) // Example data
  const uniqueRanges = ref(['$', '$$', '$$$', '$$$$']) // Example data
  
  function toggleFilter(type, value) {
    const index = props.activeFilters[type].indexOf(value)
    if (index > -1) {
      props.activeFilters[type].splice(index, 1)
    } else {
      props.activeFilters[type].push(value)
    }
  }
  
  const uniqueCities = computed(() => {
    return props.cities // Use the actual city names passed as a prop
  })
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>