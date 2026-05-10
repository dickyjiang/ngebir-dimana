<template>
  <aside class="w-full">
    <!-- <div class="w-full pb-2 border-b border-gray-400 mb-4">
      <h2 class="text-lg font-medium">Filter</h2>
    </div> -->

    <div
      class="w-full pb-2 border-b border-gray-400 flex justify-between items-center"
    >
      <h2 class="text-lg font-medium">Lokasi</h2>
      <button
        v-if="activeFilters.city && activeFilters.city.length > 0"
        @click="resetCityFilters"
        class="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100"
      >
        Reset Lokasi
      </button>
    </div>
    <div class="flex flex-wrap gap-2 text-sm text-gray-600 text-nowrap my-4 overflow-auto">
      <button
        v-for="parentCity in uniqueCities.parentCities"
        :key="parentCity.city_slug"
        @click="handleFilterToggle('city', parentCity.city_slug)"
        :class="{
          'bg-black text-yellow-500 border-yellow-500 font-medium': selectedCities.has(parentCity.city_slug),
          'bg-yellow-400 text-gray-900 border-transparent': !selectedCities.has(parentCity.city_slug),
        }"
        class="px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer"
      >
        {{ parentCity.city_name }}
      </button>
    </div>
  </aside>
</template>

<script setup>
  import { computed } from 'vue';

  const { trackLocationFilter } = useAnalytics();

  const props = defineProps({
    activeFilters: Object,
    cities: Object,
    onNearbyToggle: Function,
    isNearbyActive: Boolean,
    locationLoading: Boolean,
  });

  const emit = defineEmits(['toggle-city', 'reset-cities']);

  const selectedCities = computed(() => new Set(props.activeFilters?.city || []));

  const uniqueCities = computed(() => {
    return props.cities || { parentCities: [], childCities: [] };
  });

  function handleFilterToggle(type, value) {
    if (type === 'city') {
      trackLocationFilter(value);
      emit('toggle-city', value);
    }
  }

  function resetCityFilters() {
    emit('reset-cities');
  }
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
