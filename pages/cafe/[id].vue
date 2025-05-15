<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="flex flex-col gap-4">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
    </div>
    <div v-else-if="cafe">
      <h1 class="text-4xl font-bold mb-4">{{ cafe.data.name }}</h1>
      <div class="flex flex-col md:flex-row items-start justify-between gap-4">
        <div class="w-full md:w-1/2">
          <NuxtImg
            :src="cafe.data.photo"
            alt="Cafe Image"
            class="w-full h-64 object-cover mb-4 rounded-lg"
            placeholder="/img/noimg.webp"
          />
          <div class="px-4">
            <div
              class="flex items-end gap-2 justify-between border-b border-gray-500 pb-2"
            >
              <div class="w-10 h-10 rounded-full overflow-hidden">
                <NuxtImg
                  :src="cafe.data.logo"
                  alt="Cafe Logo"
                  class="w-full h-full object-cover mb-4"
                  placeholder="/img/logo-default.png"
                />
              </div>

              <div class="flex items-center justify-between gap-2 py-1">
                <div class="flex items-center gap-1">
                  <img
                    src="/src/assets/img/city.svg"
                    alt="location"
                    class="h-4"
                  />
                  <p class="text-gray-500">{{ cafe.data.city }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-2">
                    <img
                      src="/src/assets/img/rating.svg"
                      alt="rating"
                      class="h-4"
                    />
                    <p class="text-gray-500">{{ cafe.data.rating }}</p>
                  </div>
                  <p class="text-gray-500 font-semibold">
                    {{ cafe.data.range }}
                  </p>
                </div>
              </div>
            </div>
            <div
              class="flex flex-col sm:flex-row gap-2 items-center justify-center"
            >
              <button
                v-if="
                  (cafe.data.lat && cafe.data.long) || cafe.data.location_link
                "
                @click="openInGoogleMaps"
                class="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 max-w-1/2"
              >
                <i class="fas fa-map-marker-alt"></i>
                Open in Google Maps
              </button>
              <button
                v-if="cafe.data.site || cafe.data.instagram_url"
                @click="openWebsite"
                class="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <i class="fas fa-globe"></i>
                Visit
              </button>
            </div>
            <p class="text-md text-gray-500 my-2">
              {{ cafe.data.description }}
            </p>
            <div>
              <div class="py-4">
                <div class="flex flex-wrap gap-2">
                  <a
                    v-for="feature in cafe.features"
                    :key="feature.id"
                    :href="`/cafes?features=${feature.feature_slug}`"
                    class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    {{ feature.name }}
                  </a>
                </div>
              </div>
            </div>
            <div class="flex flex-col" v-if="cafe.data.working_hours">
              <h2 class="text-lg font-semibold">Working Hours</h2>
              <table
                class="min-w-full border-collapse border border-gray-300 text-sm mt-2"
              >
                <thead>
                  <tr>
                    <th class="border border-gray-300 px-4 py-2">Day</th>
                    <th class="border border-gray-300 px-4 py-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(hours, day) in JSON.parse(cafe.data.working_hours)"
                    :key="day"
                  >
                    <td class="border border-gray-300 px-4 py-2">{{ day }}</td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ hours }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- @budisentosa thumbnail na -->

        <div class="w-full md:w-1/2 flex flex-col gap-8">
          <div
            class="grid grid-cols-4 sm:grid-cols-4 gap-2 flex-1 items-start overflow-y-scroll"
          >
            <div v-for="(cafePic, index) in cafe.cafe_pics" :key="index">
              <img
                class="rounded-md object-cover cursor-pointer w-full h-full"
                :src="cafePic.url"
                @click="openImageModal(cafePic.url)"
                :alt="`Cafe photo ${index + 1}`"
                style="aspect-ratio: 1/1"
              />
            </div>
          </div>
          <div class="border border-gray-300 rounded-lg">
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
                <!-- <LMarker
                  v-if="cafe.data.lat && cafe.data.long"
                  :lat-lng="[
                    Number(cafe.data.lat + 0.1),
                    Number(cafe.data.long),
                  ]"
                >
                  <LPopup> teuing tah </LPopup>
                </LMarker> -->
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
          </div>
        </div>
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
      @click="closeModal"
    >
      <div class="relative max-w-4xl max-h-screen p-4" @click.stop>
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <img
          :src="selectedImage"
          class="max-h-[90vh] max-w-full object-contain"
          @click.stop
          alt="Full screen image"
        />
      </div>
    </div>
  </Teleport>
  <!-- @budi section ini showing cafe yg realted dengan last search result - atau kalau bukan hasil search show close location dari cafe terpilih) -->
  <section id="related-cafes" class="my-4">
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
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useNuxtApp } from '#app';
  import { useSeo } from '~/composables/useSeo';

  const route = useRoute();
  const cafe = ref(null);
  const loading = ref(true);
  const about = ref({});
  const showModal = ref(false);
  const selectedImage = ref('');

  function openImageModal(imageUrl) {
    selectedImage.value = imageUrl;
    showModal.value = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeModal() {
    showModal.value = false;
    selectedImage.value = '';
    document.body.style.overflow = ''; // Restore scrolling
  }

  useSeo({
    title: 'Website Paling Lengkap buat Cari Tempat Ngopi!',
    description: 'Satu Klik, Ribuan Cafe! Temukan yang Pas untuk Kamu.',
    image: '/img/OG-img.png',
    url: `https://ngopi.di-mana.com/cafes/${route.params.id}`,
    type: 'article',
  });

  function openInGoogleMaps() {
    // encan
    // First priority: use location_link if available
    if (cafe.value?.data.location_link) {
      window.open(cafe.value.data.location_link, '_blank');
      return;
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
      const lat = cafe.value.data.lat.toString().replace(',', '.').trim();
      const lng = cafe.value.data.long.toString().replace(',', '.').trim();
      const url = `https://www.google.com/maps/search/${encodeURIComponent(
        cafe.value.data.name
      )}/@${lat},${lng},17z`;
      window.open(url, '_blank');
    } else {
      console.error('No location data available');
    }
  }

  function openWebsite() {
    if (cafe.value?.data.site) {
      window.open(cafe.value.data.site, '_blank');
    }
  }

  onMounted(async () => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && showModal.value) {
        closeModal();
      }
    });
    try {
      const cafeData = await $fetch(`/api/cafe/${route.params.id}`, {
        headers: useRequestHeaders(['cookie']),
        onResponseError({ response }) {
          console.error(
            `Server error: ${response.status} ${response.statusText}`
          );
          loading.value = false;
        },
      });

      cafe.value = cafeData;
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      loading.value = false;
    }
  });
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

  img {
    transition: transform 0.2s;
  }

  img:hover {
    transform: scale(1.05);
  }
</style>
