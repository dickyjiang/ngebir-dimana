<template>
  <section id="popular-categories">
    <div class="container mx-auto py-4">
      <h2 class="text-center text-2xl font-bold">
        Popular Categories
      </h2>
      <div class="flex items-center justify-center flex-wrap gap-4 py-4">
        <div v-for="category in categories" :key="category" class="bg-gray-200 px-4 py-2 rounded-full text-sm">
          {{ category }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
/* You can add component-specific styles here if needed */
</style> 