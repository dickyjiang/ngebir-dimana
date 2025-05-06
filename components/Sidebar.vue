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
    <div class="flex flex-wrap gap-3 text-sm text-gray-500 text-nowrap my-4">
      <!-- <button
        v-for="city in uniqueCities.parentCities"
        :key="city.city_slug"
        @click="handleFilterToggle('city', city.city_slug)"
        :class="{
          'bg-gray-800 text-white': activeFilters.city.includes(city.city_slug),
          'bg-gray-100': !activeFilters.city.includes(city.city_slug),
        }"
        class="px-3 py-1 rounded-full"
      >
        {{ city.city }}
      </button> -->
      <div
        v-for="parentCity in uniqueCities.parentCities"
        :key="parentCity.city_slug"
        class="mb-4"
      >
        <h3 class="font-medium mb-2">{{ parentCity.city_name }}</h3>
        <div class="flex flex-wrap gap-2 text-sm ml-2">
          <!-- Child cities belonging to this parent -->
          <button
            v-for="childCity in getChildCities(parentCity.city_slug)"
            :key="childCity.city_slug"
            @click="handleFilterToggle('city', childCity.city_slug)"
            :class="{
              'bg-gray-800 text-white': activeFilters.city.includes(
                childCity.city_slug
              ),
              'bg-gray-100': !activeFilters.city.includes(childCity.city_slug),
            }"
            class="px-3 py-1 rounded-full"
          >
            {{ childCity.city_name }}
          </button>

          <!-- If no child cities, show a disabled indicator -->
          <span
            v-if="getChildCities(parentCity.city_slug).length === 0"
            class="text-gray-400 italic px-3 py-1"
          >
            No sub-locations
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useFilterToggle } from '~/composables/useFilterToggle';

  const { toggleFilter, resetFiltersCity } = useFilterToggle();

  const props = defineProps({
    activeFilters: Object,
    cities: Object,
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
    return props.cities || { parentCities: [], childCities: [] }; // Add a default value
  });

  function getChildCities(parentSlug) {
    if (!props.cities || !props.cities.childCities) return [];
    return props.cities.childCities.filter(
      (city) => city.city_parent === parentSlug
    );
  }

  async function resetCityFilters() {
    await resetFiltersCity(props.activeFilters);
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
