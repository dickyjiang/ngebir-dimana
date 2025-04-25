<template>
  <section id="new-cafes" class="my-4 bg-gray-700 hidden">
    <div
      class="my-4 w-full py-2 mx-auto flex flex-row gap-4 items-center justify-center bg-gray-200 overflow-x-auto"
    >
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
    >
      <div
        v-for="n in itemsPerPage"
        :key="n"
        class="rounded-md flex flex-col h-full pb-4 border overflow-hidden"
      >
        <div class="skeleton skeleton-image"></div>
        <div class="flex-1 flex-col px-4">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    </div>
      <div v-else-if="cafes.length === 0" class="text-center py-4">
        <p class="text-gray-800">No new cafes found</p>
      </div>
      <div v-else>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <li
          v-for="(cafe, index) in cafes"
          :key="index"
          class="rounded-md flex flex-col h-full pb-4 border overflow-hidden"
        >
          <NuxtLink :to="`/cafe/${cafe.slug_name}`">
            <NuxtImg
              alt="Cafe Image"
              class="w-full h-48 object-cover mb-4"
              :src="cafe.photo"
              placeholder="/img/noimg.webp"
            />
            <div class="flex-1 flex-col px-4">
              <h2
                class="text-lg text-gray-800 leading-tight line-clamp-2 font-semibold"
              >
                {{ cafe.name }}
              </h2>
              <p class="text-sm text-gray-500 line-clamp-2 mt-2">
                {{ cafe.description }}
              </p>
            </div>
            <div class="flex justify-between px-4 mt-8">
              <div class="flex items-center gap-1">
                <img
                  src="/src/assets/img/city.svg"
                  alt="location"
                  class="h-3"
                />
                <p class="text-gray-500 text-xs">{{ cafe.city }}</p>
              </div>
              <div class="flex items-center gap-1 font-semibold">
                <p class="text-gray-500 text-xs">{{ cafe.range }}</p>
              </div>
              <div class="flex items-center gap-1">
                <img src="/src/assets/img/rating.svg" alt="star" class="h-3" />
                <p class="text-gray-500 text-xs">{{ cafe.rating_num }}</p>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
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
    itemsPerPage: {
      type: Number,
      default: 12,
    },
  });
</script>

<style scoped>
  /* Add any component-specific styles here */
</style>
