<template>
  <section id="new-cafes" class="my-4">
    <div
      class="my-4 w-full py-2 mx-auto flex flex-row gap-4 items-center justify-center bg-gray-200 overflow-x-auto"
    >
      <div v-if="loading" class="text-center py-4">
        <p class="text-gray-800">Loading latest cafes...</p>
      </div>
      <div v-else-if="cafes.length === 0" class="text-center py-4">
        <p class="text-gray-800">No new cafes found</p>
      </div>
      <template v-else>
        <div
          v-for="cafe in cafes"
          :key="cafe.id"
          class="text-gray-800 font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80 flex-shrink-0 relative"
        >
          <img
            v-if="cafe.thumbnail"
            :src="cafe.thumbnail"
            :alt="cafe.name"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 bg-black bg-opacity-40 p-4 flex flex-col justify-end"
          >
            <h3 class="text-white text-lg font-bold">{{ cafe.name }}</h3>
            <p class="text-white text-sm">{{ cafe.city }}</p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
  defineProps({
    cafes: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });
</script>

<style scoped>
  /* Add any component-specific styles here */
</style>
