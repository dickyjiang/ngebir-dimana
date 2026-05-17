<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onBeforeUnmount } from 'vue'
import '@fortawesome/fontawesome-free/css/all.css'
import hoursAnimationData from '../public/animations/24-hours.json'
import goldenRetrieverAnimationData from '../public/animations/golden-retriever.json'
import coffeeBeansAnimationData from '../public/animations/coffee-beans.json'
import terdekatAnimationData from '../public/animations/terdekat.json'
import wheelchairAnimationData from '../public/animations/wheelchair.json'

const { resetFiltersFeature } = useFilterToggle()
const { trackCategoryTab, trackFilter, trackSearch } = useAnalytics()

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
})

const emit = defineEmits(['search', 'toggle-nearby', 'toggle-feature'])

const searchQuery = ref('')
const filterType = ref('all') // Add this new ref

function handleSearch() {
  emit('search', {
    query: searchQuery.value,
    filter: filterType.value,
  })
}

function clearSearch() {
  searchQuery.value = ''
  filterType.value = 'all'
  emit('search', {
    query: '',
    filter: 'all',
  })
}

function handleSearchButton() {
  if (searchQuery.value) {
    clearSearch()
  } else {
    handleSearch()
  }
}

function toggleNearbyFilter() {
  // Track nearby filter toggle — new state is opposite of current isNearbyActive prop
  trackFilter('cafe-terdekat', props.isNearbyActive ? 'off' : 'on')
  emit('toggle-nearby')
}

function handleFeatureToggle(feature_id: string) {
  // Determine new state: if feature is active it will be turned off, and vice versa
  const isCurrentlyActive = props.activeFilters.features.includes(feature_id)
  // Track feature filter chip toggle with its resulting state
  trackFilter(feature_id, isCurrentlyActive ? 'off' : 'on')
  emit('toggle-feature', feature_id)
}

function handleFilterTypeChange() {
  // Track category filter type switch (All / Bar / Brewery / Supplier)
  trackCategoryTab(filterType.value)
  handleSearch()
}

async function resetFeatureFilter() {
  await resetFiltersFeature(props.activeFilters)
}

let hoursAnim = null
let petAnim = null
let specialtyAnim = null
let terdekatAnim = null
let wheelchairAnim = null // Add this line

// Modify the play animation function to handle active state
function playAnimation(anim) {
  if (anim && anim.isPaused) {
    anim.play()
  }
}

// Modify the pause animation function to check for active state
function pauseAnimation(anim, isActive = false) {
  if (anim && !anim.isPaused && !isActive) {
    anim.pause()
  }
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const lottie = (await import('lottie-web')).default

    const hoursContainer = document.getElementById('hours-animate')
    const petContainer = document.getElementById('pet-animate')
    const specialtyContainer = document.getElementById('specialty-animate')
    const terdekatContainer = document.getElementById('terdekat-animate')
    const wheelchairContainer = document.getElementById('wheelchair-animate')

    hoursAnim = lottie.loadAnimation({
      container: hoursContainer,
      renderer: 'svg',
      loop: true,
      autoplay: props.activeFilters.features.includes('24-hours'),
      animationData: hoursAnimationData,
    })

    petAnim = lottie.loadAnimation({
      container: petContainer,
      renderer: 'svg',
      loop: true,
      autoplay: props.activeFilters.features.includes('pets-dogs-allowed'),
      animationData: goldenRetrieverAnimationData,
    })

    specialtyAnim = lottie.loadAnimation({
      container: specialtyContainer,
      renderer: 'svg',
      loop: true,
      autoplay: props.activeFilters.features.includes('specialty-coffee'),
      animationData: coffeeBeansAnimationData,
    })

    terdekatAnim = lottie.loadAnimation({
      container: terdekatContainer,
      renderer: 'svg',
      loop: true,
      autoplay: props.isNearbyActive,
      animationData: terdekatAnimationData,
    })

    wheelchairAnim = lottie.loadAnimation({
      container: wheelchairContainer,
      renderer: 'svg',
      loop: true,
      autoplay: props.activeFilters.features.includes('accessibility-wheelchair-accessible'),
      animationData: wheelchairAnimationData,
    })
  }
})

onBeforeUnmount(() => {
  if (hoursAnim) hoursAnim.destroy()
  if (petAnim) petAnim.destroy()
  if (specialtyAnim) specialtyAnim.destroy()
  if (terdekatAnim) terdekatAnim.destroy()
  if (wheelchairAnim) wheelchairAnim.destroy()
})
</script>

<template>
  <section id="hero" class="my-4 px-4">
    <div
      class="container mx-auto min-h-[30vh] lg:max-w-[98%] py-8 rounded-2xl overflow-clip relative flex items-center justify-center">
      <img
        class="absolute object-cover object-center w-full h-full"
        src="/src/assets/img/hero.webp"
        alt="Ngebir Dimana - Direktori Bar Indonesia" />
      <div class="absolute inset-0 bg-black opacity-40 z-[1]"></div>
      <div
        class="z-[2] flex flex-col items-center justify-center w-[90%] sm:w-[90%] mx-auto h-full">
        <h1
          class="text-2xl sm:text-4xl md:text-5xl text-white text-center font-medium tracking-wide mb-2 sm:mb-4">
          Ngebir dimana?
        </h1>
        <h2 class="text-sm md:text-xl tracking-wide text-white mb-2 sm:mb-4 text-center">
          {{ totalCafes ? `${totalCafes} Tempat nge-Beer` : 'Tempat nge-Beer' }}
        </h2>
        <div
          class="mt-2 sm:mt-4 w-full md:w-3/4 flex flex-col gap-2 sm:gap-4 items-center justify-center px-4">
          <div class="flex items-center gap-2 w-full md:w-1/2">
            <div class="relative flex items-center w-full">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search bars..."
                class="text-sm sm:text-base border w-full border-gray-600 rounded-lg p-2 sm:p-3 pl-4 pr-[120px]"
                @input="handleSearch" />
              <div class="absolute right-0 top-0 h-full flex items-center gap-2 pr-2">
                <button class="text-gray-500 mr-2" @click="handleSearchButton">
                  <i :class="searchQuery ? 'fa fa-times' : 'fas fa-search'"></i>
                </button>
                <select
                  v-model="filterType"
                  class="h-full bg-transparent text-gray-600 focus:outline-none text-sm sm:text-base pl-2 border-l border-gray-300"
                  @change="handleFilterTypeChange">
                  <option value="all">All</option>
                  <option value="bar">Bar</option>
                  <option value="brewery">Brewery</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
            </div>
          </div>
          <div v-show="false" class="flex flex-wrap items-center justify-center gap-2 w-full">
            <button
              @click="toggleNearbyFilter"
              @mouseenter="playAnimation(terdekatAnim)"
              @mouseleave="pauseAnimation(terdekatAnim, isNearbyActive)"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500': isNearbyActive,
                'text-gray-100 border-gray-400': !isNearbyActive,
              }"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-0 sm:py-1 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation">
              <span id="terdekat-animate" class="w-8 h-8"></span>
              <span>Bar terdekat</span>
            </button>
            <!-- Cafe Terbaru filter -->
            <button
              @click="handleFeatureToggle('24-hours')"
              @mouseenter="playAnimation(hoursAnim)"
              @mouseleave="pauseAnimation(hoursAnim, activeFilters.features.includes('24-hours'))"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('24-hours'),
                'text-gray-100 border-gray-400': !activeFilters.features.includes('24-hours'),
              }"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-0 sm:py-1 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation">
              <span id="hours-animate" class="w-8 h-8"></span>
              <span>24 hours</span>
            </button>
            <button
              @click="handleFeatureToggle('specialty-coffee')"
              @mouseenter="playAnimation(specialtyAnim)"
              @mouseleave="
                pauseAnimation(specialtyAnim, activeFilters.features.includes('specialty-coffee'))
              "
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('specialty-coffee'),
                'text-gray-100 border-gray-400':
                  !activeFilters.features.includes('specialty-coffee'),
              }"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-0 sm:py-1 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation">
              <span id="specialty-animate" class="w-8 h-8"></span>
              <span>Craft Beer</span>
            </button>
            <button
              @click="handleFeatureToggle('pets-dogs-allowed')"
              @mouseenter="playAnimation(petAnim)"
              @mouseleave="
                pauseAnimation(petAnim, activeFilters.features.includes('pets-dogs-allowed'))
              "
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('pets-dogs-allowed'),
                'text-gray-100 border-gray-400':
                  !activeFilters.features.includes('pets-dogs-allowed'),
              }"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-0 sm:py-1 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation">
              <span id="pet-animate" class="w-8 h-8"></span>
              <span>Pet Friendly</span>
            </button>
            <!-- <button
              @click="handleFeatureToggle('crowd-family-friendly')"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('crowd-family-friendly'),
                'border-black': !activeFilters.features.includes('crowd-family-friendly'),
              }">
              Family Friendly
            </button> -->
            <button
              @click="handleFeatureToggle('accessibility-wheelchair-accessible')"
              @mouseenter="playAnimation(wheelchairAnim)"
              @mouseleave="
                pauseAnimation(
                  wheelchairAnim,
                  activeFilters.features.includes('accessibility-wheelchair-accessible')
                )
              "
              class="text-white border border-white mt-2 px-3 sm:px-4 py-0 sm:py-1 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('accessibility-wheelchair-accessible'),
                'text-gray-100 border-gray-400': !activeFilters.features.includes(
                  'accessibility-wheelchair-accessible'
                ),
              }">
              <span id="wheelchair-animate" class="w-8 h-8"></span>
              <span>Wheelchair Friendly</span>
            </button>
            <!-- <button
              @click="handleFeatureToggle('service-options-outdoor-seating')"
              class="text-white border border-white mt-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base cursor-pointer touch-manipulation"
              :class="{
                'text-yellow-500 bg-black border border-yellow-500':
                  activeFilters.features.includes('service-options-outdoor-seating'),
                'border-black': !activeFilters.features.includes('service-options-outdoor-seating'),
              }">
              Outdoor
            </button> -->
            <button
              v-if="activeFilters.features.length > 0"
              class="ml-2 text-yellow-500 text-xs sm:text-base cursor-pointer touch-manipulation"
              @click="resetFeatureFilter">
              Reset Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@font-face {
  font-family: 'Sharp Grotesk';
  src: url('~/assets/fonts/sharp-grotesk-medium-25-regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

h1 {
  font-family: 'Sharp Grotesk', sans-serif;
  /* Fallback to sans-serif */
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 1.5rem;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0 center;
  background-size: 1em;
}
</style>
