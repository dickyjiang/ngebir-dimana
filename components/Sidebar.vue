<template>
  <aside class="w-full">
    <!-- <div class="w-full pb-2 border-b border-gray-400 mb-4">
      <h2 class="text-lg font-medium">Filter</h2>
    </div> -->

    <div class="w-full pb-2 border-b border-gray-400">
      <h2 class="text-lg font-medium">Lokasi</h2>
    </div>
    <div class="flex flex-wrap gap-3 text-sm text-gray-500 text-nowrap my-4">
      <!-- {{ uniqueCities }} -->
      <button
        v-for="city in uniqueCities"
        :key="city.city_slug"
        @click="handleFilterToggle('city', city.city_slug)"
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
  import { useFilterToggle } from '~/composables/useFilterToggle';

  const { toggleFilter } = useFilterToggle();

  const props = defineProps({
    activeFilters: Object,
    cities: Array,
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

  async function handleFilterToggle(type, value) {
    await toggleFilter(props.activeFilters, type, value);
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
