<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="flex flex-col gap-4">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
    </div>
    <div v-else-if="cafe">
      <h1 class="text-2xl sm:text-4xl font-bold mb-4">{{ cafe.data.name }}</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row items-stretch gap-8">
        <div>
          <div class="rounded-lg overflow-hidden max-h-96 mb-2">
            <NuxtImg
              :src="cafe.data.photo"
              alt="Cafe Image"
              class="object-cover mb-4 rounded-lg w-full h-full"
              placeholder="/img/noimg.webp" />
          </div>
          <div
            class="flex flex-row sm:items-start gap-4 sm:gap-2 justify-between border-b border-gray-500 py-2">
            <div class="flex items-center w-full ">
              <div class="flex flex-col gap-2 w-full">
                <div class="flex justify-between items-center gap-2 ">
                  <div class="flex items-center gap-2">
                    <div class="w-10 h-10 rounded-full overflow-hidden mr-2">
                      <NuxtImg
                        :src="cafe.data.logo"
                        alt="Cafe Logo"
                        class="w-full h-full object-cover mb-4"
                        placeholder="/img/logo-default.png" />
                    </div>
                    <div class="flex flex-col ">
                      <h2 class="text-lg font-semibold">
                        {{ cafe.data.name }}
                      </h2>
                      <div class="flex items-center gap-3">
                        <div class="flex items-center">
                          <img src="/src/assets/img/city.svg" alt="location" class="h-4" />
                          <p class="text-gray-500">{{ cafe.data.city }}</p>
                        </div>
                        <div class="flex items-center gap-1">
                            <img src="/src/assets/img/rating.svg" alt="rating" class="h-4" />
                            <p class="text-gray-500">{{ cafe.data.rating }}</p>
                          <p class="text-gray-500 font-semibold">
                            {{ cafe.data.range }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-center gap-2 max-w-1/2">
                      <!-- kl owner na budi enggak keluar  -->
                      <NuxtLink
                        :to="`/profile-public/${cafe.data.uuid}`"
                        v-if="cafe.data.uuid != 'b069ef6a-046b-440b-9004-d5fdd0758c80'">
                        <button class="flex flex-col gap-1 items-center px-2">
                          <img
                            src="/src/assets/img/message.svg"
                            alt="share"
                            class="h-5 hover:transform hover:scale-110 transition-transform" />
                          <p class="text-xs">Kontak Owner</p>
                        </button>
                      </NuxtLink>
                      <button class="flex flex-col gap-1 items-center px-2" @click="sharePage">
                        <img
                          src="/src/assets/img/send.svg"
                          alt="share"
                          class="h-5 hover:transform hover:scale-110 transition-transform" />
                        <p class="text-xs">Share</p>
                      </button>
                      <!-- @budi add function add review ( engke iyeu mah teu urgent) -->
                      <!-- <button class="flex fl items-center px-2">
                  <img
                    src="/src/assets/img/add-review.svg"
                    alt="review"
                    class="h-6"
                  />
                </button> -->
                      <!-- @budi add function like nantinya kita bisa show how many likes nya  -->
                      <!-- <button class="flex items-center px-2">
                  <img src="/src/assets/img/love.svg" alt="like" class="h-6" />
                </button> -->
                    </div>
                </div>
                <div class="md:w-3/4">
                  <p class="text-sm text-gray-500">{{ cafe.data.street }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="cafe.cafe_pics && cafe.cafe_pics.length > 0" class="grid grid-cols-4 gap-2 items-start overflow-y-hidden mb-2">
          <div v-for="(cafePic, index) in cafe.cafe_pics" :key="index">
            <img
              class="rounded-md object-cover cursor-pointer w-full h-full"
              :src="cafePic.url"
              @click="openImageModal(cafePic.url, index)"
              :alt="`Cafe photo ${index + 1}`"
              style="aspect-ratio: 1/1" />
          </div>
        </div>
        <div>
          <div class="description-content">
            <p class="text-md text-gray-500 mb-2" v-html="sanitizedDescription"></p>
          </div>
          <div
            class="flex flex-col sm:flex-row gap-2 items-center justify-center mb-4 pb-4 border-b border-gray-500">
            <button
              v-if="(cafe.data.lat && cafe.data.long) || cafe.data.location_link"
              @click="openInGoogleMaps"
              class="mt-4 md:w-1/2 bg-gray-800 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 max-w-1/2">
              <i class="fas fa-map-marker-alt"></i>
              Open in Google Maps
            </button>
            <button
              v-if="cafe.data.site || cafe.data.instagram_url"
              @click="openWebsite"
              class="mt-4 md:w-1/2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
              <i class="fas fa-globe"></i>
              Visit
            </button>
          </div>
          <div class="py-4">
            <div class="flex flex-wrap gap-2">
              <a
                v-for="feature in cafe.features"
                :key="feature.id"
                :href="`/cafes?features=${feature.feature_slug}`"
                class="px-3 py-2 flex text-white text-xs items-center gap-2  rounded-full bg-gray-800 hover:bg-gray-800 transition-colors"
                :class="{
                  'bg-yellow-500 text-gray-800': feature.business_type === 'cafe',
                  'bg-yellow-800 text-white': feature.business_type === 'roastery',
                  'bg-stone-500 text-white': feature.business_type === 'supplier',
                }">
                  {{ feature.name }}
              </a>
            </div>
          </div>
        </div>
        <div
          class="flex flex-col mt-4"
          v-if="cafe.data.working_hours && isValidJson(cafe.data.working_hours)">
          <h2 class="text-lg font-semibold">Working Hours</h2>
          <table class="min-w-full border-collapse border border-gray-300 text-sm mt-2">
            <thead>
              <tr>
                <th class="border border-gray-300 px-4 py-2">Day</th>
                <th class="border border-gray-300 px-4 py-2">Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(hours, day) in JSON.parse(cafe.data.working_hours)" :key="day">
                <td class="border border-gray-300 px-4 py-2">{{ day }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ hours }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- <div class="rounded-lg overflow-hidden ">
          <ClientOnly>
            <LMap
              style="height: 350px"
              :zoom="15"
              :center="
                cafe.data.lat && cafe.data.long
                  ? [Number(cafe.data.lat), Number(cafe.data.long)]
                  : [0, 0]
              "
              :use-global-leaflet="false"
            >
              <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                layer-type="base"
                name="OpenStreetMap"
              />
              <LMarker
                v-if="cafe.data.lat && cafe.data.long"
                :lat-lng="[Number(cafe.data.lat), Number(cafe.data.long)]"
              >
                <LPopup>
                  {{ cafe.data.name }}
                </LPopup>
              </LMarker>
            </LMap>
          </ClientOnly>
        </div> -->
      </div>
    </div>
    <div v-else class="text-center text-gray-500">Cafe not found.</div>
  </div>
  <!-- Image Modal -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
      style="z-index: 9999"
      @click="closeModal">
      <div class="relative max-w-4xl max-h-screen p-4" @click.stop>
        <!-- Close button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Navigation buttons -->
        <button
          v-if="selectedImageIndex > 0"
          @click.stop="previousImage"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-50">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          v-if="selectedImageIndex < cafe.cafe_pics.length - 1"
          @click.stop="nextImage"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-50">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Image -->
        <img
          :src="selectedImage"
          class="max-h-[90vh] max-w-full object-contain"
          @click.stop
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          alt="Full screen image" />

        <!-- Image counter -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
          {{ selectedImageIndex + 1 }} / {{ cafe.cafe_pics.length }}
        </div>
      </div>
    </div>
  </Teleport>
  <!-- @budi section ini showing cafe yg realted dengan last search result - atau kalau bukan hasil search show close location dari cafe terpilih) -->
  <!-- <section id="related-cafes" class="my-4">
    <div
      class="my-4 w-full py-2 mx-auto flex flex-row gap-4 items-center justify-center bg-gray-200"
    >
      <div
        class="text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80"
      >
        Cafe Terbaru 1
      </div>
      <div
        class="text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80"
      >
        Cafe Terbaru 2
      </div>
      <div
        class="text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80"
      >
        Cafe Terbaru 3
      </div>
      <div
        class="text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80"
      >
        Cafe Terbaru 4
      </div>
    </div>
  </section> -->
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useNuxtApp } from '#app'
import { useHead } from '#imports'
import DOMPurify from 'dompurify'

const route = useRoute()
const cafe = ref(null)
const loading = ref(true)
const about = ref({})
const showModal = ref(false)
const selectedImage = ref('')
const selectedImageIndex = ref(0) // Track current image index

// Add these variables with other refs
const touchStartX = ref(0)
const touchEndX = ref(0)

function isValidJson(str) {
  if (!str) return false
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}
// Add these new functions
function handleTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
}

function handleTouchEnd(e) {
  touchEndX.value = e.changedTouches[0].clientX
  handleSwipe()
}

function handleSwipe() {
  const swipeDistance = touchEndX.value - touchStartX.value
  const minSwipeDistance = 50 // minimum distance for swipe

  if (Math.abs(swipeDistance) >= minSwipeDistance) {
    if (swipeDistance > 0) {
      // Swiped right - show previous image
      previousImage()
    } else {
      // Swiped left - show next image
      nextImage()
    }
  }
}

function openImageModal(imageUrl, index) {
  selectedImage.value = imageUrl
  selectedImageIndex.value = index
  showModal.value = true
  document.body.style.overflow = 'hidden'
  // Reset touch values
  touchStartX.value = 0
  touchEndX.value = 0
}

function closeModal() {
  showModal.value = false
  selectedImage.value = ''
  document.body.style.overflow = '' // Restore scrolling
}

function nextImage() {
  if (selectedImageIndex.value < cafe.value.cafe_pics.length - 1) {
    selectedImageIndex.value++
    selectedImage.value = cafe.value.cafe_pics[selectedImageIndex.value].url
  }
}

function previousImage() {
  if (selectedImageIndex.value > 0) {
    selectedImageIndex.value--
    selectedImage.value = cafe.value.cafe_pics[selectedImageIndex.value].url
  }
}

// Watch for changes in cafe data and update meta
watch(() => cafe.value, (newCafe) => {
  if (newCafe && newCafe.data) {
    const cafeData = newCafe.data
    const features = newCafe.features?.map(f => f.name).join(', ') || ''
    
    useHead({
      title: `${cafeData.name} – Tempat Ngopi di ${cafeData.city}`,
      meta: [
        {
          name: 'description',
          content: `${cafeData.description?.substring(0, 155)}...` || 
                  `Temukan ${cafeData.name} di ${cafeData.city}. ${features}`
        },
        {
          property: 'og:title',
          content: `${cafeData.name} – Tempat Ngopi di ${cafeData.city}`
        },
        {
          property: 'og:description',
          content: cafeData.description || 
                  `Nikmati kopi dan suasana di ${cafeData.name}, ${cafeData.city}. ${features}`
        },
        {
          property: 'og:image',
          content: cafeData.photo || '/img/OG-img.png'
        },
        {
          property: 'og:url',
          content: `https://ngopi.di-mana.com/cafe/${route.params.id}`
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        }
      ]
    })
  }
}, { immediate: true })

function openInGoogleMaps() {
  // encan
  // First priority: use location_link if available
  if (cafe.value?.data.location_link) {
    window.open(cafe.value.data.location_link, '_blank')
    return
  }

  // // Second priority: use place_id
  // if (cafe.value?.place_id) {
  //   const url = `https://www.google.com/maps/place/?q=place_id:${cafe.value.place_id}`;
  //   window.open(url, '_blank');
  //   return;
  // }

  // // Third priority: use google_id
  // if (cafe.value?.google_id) {
  //   const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  //     cafe.value.name
  //   )}&query_place_id=${cafe.value.google_id}`;
  //   window.open(url, '_blank');
  //   return;
  // }

  // Fallback: use coordinates if other options aren't available
  if (cafe.value.data?.lat && cafe.value?.data.long) {
    const lat = cafe.value.data.lat.toString().replace(',', '.').trim()
    const lng = cafe.value.data.long.toString().replace(',', '.').trim()
    const url = `https://www.google.com/maps/search/${encodeURIComponent(
      cafe.value.data.name
    )}/@${lat},${lng},17z`
    window.open(url, '_blank')
  } else {
    console.error('No location data available')
  }
}

function openWebsite() {
  if (cafe.value?.data.site) {
    window.open(cafe.value.data.site, '_blank')
  }
}

onMounted(async () => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && showModal.value) {
      closeModal()
    }
  })
  try {
    const cafeData = await $fetch(`/api/cafe/${route.params.id}`, {
      headers: useRequestHeaders(['cookie']),
      onResponseError({ response }) {
        console.error(`Server error: ${response.status} ${response.statusText}`)
        loading.value = false
      },
    })

    cafe.value = cafeData
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
})
async function sharePage() {
  try {
    await navigator.share({
      title: document.title,
      url: window.location.href,
      text: 'Lagi cari tempat ngopi? Cek Cafe ini!', // Optional description
    })
    console.log('Shared successfully')
  } catch (error) {
    console.error('Error sharing:', error)
  }
}

const sanitizedDescription = computed(() => {
  return cafe.value?.data.description 
    ? DOMPurify.sanitize(cafe.value.data.description)
    : ''
})
</script>

<style scoped>
.skeleton {
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
  width: 80%;
}

.skeleton-image {
  height: 200px;
  width: 100%;
  margin-bottom: 1em;
}

.fixed {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* img {
  transition: transform 0.2s;
}

img:hover {
  transform: scale(1.05);
} */

.description-content :deep(p) {
  margin-bottom: 1rem;
}

.description-content :deep(a) {
  color: #3182ce;
  text-decoration: underline;
}

.description-content :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.description-content :deep(ol) {
  list-style-type: decimal;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.description-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.description-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
}
</style>
