<template>
  <aside class="w-full">
    <div class="w-full pb-2 border-b border-gray-400 mb-4">
      <h2 class="text-lg font-medium">Filter</h2>
    </div>

    <div class="mb-8">
      <h3 class="text-sm font-medium">Rating</h3>
      <div class="flex flex-wrap gap-2 text-xs text-nowrap my-4">
        <button
          v-for="rating in ratings"
          :key="rating.rating"
          @click="toggleFilter('rating', rating.rating)"
          :class="{
            'bg-gray-800 text-white': activeFilters.rating.includes(
              rating.rating
            ),
            'bg-none border border-gray-400': !activeFilters.rating.includes(
              rating.rating
            ),
          }"
          class="px-3 py-2 rounded-full"
        >
          {{ rating.rating }} Stars
        </button>
      </div>
    </div>
    <div class="mb-8">
      <h3 class="text-sm font-medium">Price Range</h3>
      <div class="flex flex-wrap gap-2 text-xs text-nowrap my-4">
        <button
          v-for="range in uniqueRanges"
          :key="range.range"
          @click="toggleFilter('range', range.range)"
          :class="{
            'bg-gray-800 text-white w-14': activeFilters.range.includes(
              range.range
            ),
            'bg-none border border-gray-400 w-14':
              !activeFilters.range.includes(range.range),
          }"
          class="px-3 py-2 rounded-full"
        >
          {{ range.range }}
        </button>
      </div>
    </div>

    <div class="w-full pb-2 border-b border-gray-400">
      <h2 class="text-lg font-medium">Lokasi</h2>
    </div>
    <div class="flex flex-wrap gap-3 text-sm text-gray-500 text-nowrap my-4">
      <!-- {{ uniqueCities }} -->
      <button
        v-for="city in uniqueCities"
        :key="city.city_slug"
        @click="toggleFilter('city', city.city_slug)"
        :class="{
          'bg-gray-800 text-white': activeFilters.city.includes(city.city_slug),
          'bg-gray-100': !activeFilters.city.includes(city.city_slug),
        }"
        class="px-3 py-1 rounded-full"
      >
        {{ city.city }}
      </button>
    </div>
  </aside>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';

  const props = defineProps({
    activeFilters: Object,
    cities: Array,
    ratings: Array,
    ranges: Array,
    // Keep these props for compatibility, but we won't use them in the sidebar
    onNearbyToggle: Function,
    isNearbyActive: Boolean,
    locationLoading: Boolean,
  });

  onMounted(() => {
    // console.log('Filter options received:', {
    //   cities: props.cities?.length || 0,
    //   ratings: props.ratings?.length || 0,
    //   ranges: props.ranges?.length || 0,
    // });
  });

  const uniqueRanges = computed(() => {
    return props.ranges && props.ranges.length > 0
      ? props.ranges
      : ['$', '$$', '$$$', '$$$$']; // Fallback to defaults
  });

  async function toggleFilter(type, value) {
    const index = props.activeFilters[type].indexOf(value);
    if (index > -1) {
      props.activeFilters[type].splice(index, 1);
    } else {
      props.activeFilters[type].push(value);
    }
    await navigateTo({
      path: '/',
      query: {
        city: props.activeFilters.city.join('-'),
        ratings: props.activeFilters.rating.join('-'),
        ranges: props.activeFilters.range.join('-'),
      },
    });
  }

  // Keep this function for compatibility but it won't be used in the sidebar
  function toggleNearbyFilter() {
    if (props.onNearbyToggle) {
      props.onNearbyToggle();
    }
  }

  const uniqueCities = computed(() => {
    return props.cities; // Use the actual city names passed as a prop
  });
</script>

<style scoped>
  /* Remove default blue focus ring and replace with black for all focusable elements */
  button:focus,
  input:focus,
  select:focus,
  textarea:focus,
  a:focus,
  [tabindex]:focus {
    outline: none;
    box-shadow: 0 0 0 1px black;
  }

  /* Ensure focus styles work with keyboard navigation for accessibility */
  button:focus:not(:focus-visible),
  input:focus:not(:focus-visible),
  select:focus:not(:focus-visible),
  textarea:focus:not(:focus-visible),
  a:focus:not(:focus-visible),
  [tabindex]:focus:not(:focus-visible) {
    box-shadow: none;
  }

  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  a:focus-visible,
  [tabindex]:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px black;
  }
</style>
