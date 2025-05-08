<script setup lang="ts">
  import { ref, defineProps, defineEmits } from 'vue';
  import '@fortawesome/fontawesome-free/css/all.css';

  const { resetFiltersFeature } = useFilterToggle();

  const props = defineProps({
    totalCafes: {
      type: Number,
      default: 0,
    },
    activeFilters: {
      type: Object,
      default: () => ({
        city: [],
        borough: [],
        features: [],
      }),
    },
    isNearbyActive: {
      type: Boolean,
      default: false,
    },
    locationLoading: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['search', 'toggle-nearby', 'toggle-feature']);

  const searchQuery = ref('');

  function handleSearch() {
    emit('search', searchQuery.value);
  }

  function clearSearch() {
    searchQuery.value = '';
    emit('search', '');
  }

  function handleSearchButton() {
    if (searchQuery.value) {
      clearSearch();
    } else {
      handleSearch();
    }
  }

  function toggleNearbyFilter() {
    emit('toggle-nearby');
  }

  function handleFeatureToggle(feature_id) {
    emit('toggle-feature', feature_id);
  }

  async function resetFeatureFilter() {
    await resetFiltersFeature(props.activeFilters);
  }
</script>

<template>
  <section id="hero" class="my-4 px-4">
    <div
      class="container mx-auto lg:max-w-[98%] py-8 rounded-2xl overflow-clip relative flex items-center justify-center"
    >
      <img
        class="absolute object-cover object-center w-full h-full"
        src="/src/assets/img/hero.webp"
        alt="hero image"
      />
      <div class="absolute inset-0 bg-black opacity-60 z-[1]"></div>
      <div
        class="z-[2] flex flex-col items-center justify-center w-[90%] sm:w-[90%] mx-auto h-full"
      >
        <h1
          class="text-2xl sm:text-4xl md:text-5xl text-white text-center font-medium tracking-wide mb-2 sm:mb-4"
        >
          Ngopi di mana?
        </h1>
        <h2
          class="text-sm md:text-xl tracking-wide text-white mb-2 sm:mb-4 text-center"
        >
          {{ totalCafes }} Cafe's Directory
        </h2>
        <div
          class="mt-2 sm:mt-4 w-full md:w-3/4 flex flex-col gap-2 sm:gap-4 items-center justify-center px-4"
        >
          <div class="flex items-center gap-2 w-full md:w-1/2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search cafes..."
              class="text-sm sm:text-base border w-full border-gray-600 rounded-lg p-2 sm:p-3 pr-8"
              @input="handleSearch"
            />
            <button class="text-gray-500 -ml-10" @click="handleSearchButton">
              <i :class="searchQuery ? 'fa fa-times' : 'fas fa-search'"></i>
            </button>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-2 w-full">
            <button
              @click="toggleNearbyFilter"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  isNearbyActive,
                'text-gray-100 border border-gray-400': !isNearbyActive,
              }"
              class="mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              <span
                v-if="locationLoading"
                class="inline-block w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                :class="{
                  'border-yellow-500': isNearbyActive,
                  'border-black': !isNearbyActive,
                }"
              ></span>
              <span>Cafe terdekat</span>
            </button>
            <!-- Cafe Terbaru filter -->
            <button
              @click="handleFeatureToggle('24-hours')"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('24-hours'),
                'text-gray-100 border-gray-400':
                  !activeFilters.features.includes('24-hours'),
              }"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              24 hours
            </button>
            <button
              @click="handleFeatureToggle('specialty-coffee')"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('specialty-coffee'),
                'text-gray-100 border-gray-400':
                  !activeFilters.features.includes('specialty-coffee'),
              }"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              Specialty | Artisan
            </button>
            <button
              @click="handleFeatureToggle('pets-dogs-allowed')"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('pets-dogs-allowed'),
                'text-gray-100 border-gray-400':
                  !activeFilters.features.includes('pets-dogs-allowed'),
              }"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              Pet Friendly
            </button>
            <button
              @click="handleFeatureToggle('crowd-family-friendly')"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('crowd-family-friendly'),
                'border-black': !activeFilters.features.includes(
                  'crowd-family-friendly'
                ),
              }"
            >
              Family Friendly
            </button>
            <button
              @click="
                handleFeatureToggle('accessibility-wheelchair-accessible')
              "
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes(
                    'accessibility-wheelchair-accessible'
                  ),
                'border-black': !activeFilters.features.includes(
                  'accessibility-wheelchair-accessible'
                ),
              }"
            >
              Wheelchair Friendly
            </button>
            <button
              @click="handleFeatureToggle('service-options-outdoor-seating')"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes(
                    'service-options-outdoor-seating'
                  ),
                'border-black': !activeFilters.features.includes(
                  'service-options-outdoor-seating'
                ),
              }"
            >
              Outdoor
            </button>
            <button
              v-if="activeFilters.features.length > 0"
              class="text-yellow-500 text-xs sm:text-base cursor-pointer touch-manipulation"
              @click="resetFeatureFilter"
            >
              Reset Filter
            </button>
            <!-- <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              WFC Friendly
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              24 jam
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              tempat nongkrong hits
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              pemandangan
            </button>
            <button
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
            >
              instagramable
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  @font-face {
    font-family: 'Sharp Grotesk';
    src: url('~/assets/fonts/sharp-grotesk-medium-25-regular.woff')
      format('woff');
    font-weight: normal;
    font-style: normal;
  }

  h1 {
    font-family: 'Sharp Grotesk', sans-serif; /* Fallback to sans-serif */
  }
</style>
