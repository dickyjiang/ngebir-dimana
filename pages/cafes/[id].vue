<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="flex flex-col gap-4">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
    </div>
    <div v-else-if="cafe">
      <h1 class="text-4xl font-bold mb-4">{{ cafe.name }}</h1>
      <div class="flex flex-col md:flex-row items-start justify-between gap-4">
        <div class="w-full md:w-1/2">
          <NuxtImg
            :src="cafe.photo"
            alt="Cafe Image"
            class="w-full h-64 object-cover mb-4 rounded-lg"
            placeholder="/img/noimg.webp"
          />
          <div class="px-4">
            <div
              class="flex items-end gap-2 justify-between border-b border-gray-500 pb-3"
            >
              <div class="w-12 h-12 rounded-full overflow-hidden">
                <NuxtImg
                  :src="cafe.logo"
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
                  <p class="text-gray-500">{{ cafe.city }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-2">
                    <img
                      src="/src/assets/img/rating.svg"
                      alt="rating"
                      class="h-4"
                    />
                    <p class="text-gray-500">{{ cafe.rating }}</p>
                  </div>
                  <p class="text-gray-500 font-semibold">{{ cafe.range }}</p>
                </div>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 items-center justify-center">
            <button
              v-if="cafe.latitude && cafe.longitude"
              @click="openInGoogleMaps"
              class="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
              <i class="fas fa-map-marker-alt"></i>
              Open in Google Maps
            </button>
            <button
              v-if="cafe.site || cafe.instagram_url"
              @click="openWebsite"
              class="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
              <i class="fas fa-globe"></i>
              Visit
            </button>
            </div>
            <p class="text-lg text-gray-700 my-2">{{ cafe.description }}</p>
            <div>
              <div class="py-4">
                <div v-if="about && Object.keys(about).length">
                  <div class="flex flex-wrap gap-2">
                    <p
                      v-if="
                        about.Accessibility?.['Wheelchair-accessible entrance']
                      "
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      Wheelchair-accessible
                    </p>
                    <div
                      v-if="about.Atmosphere?.Casual"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      Casual
                    </div>
                    <div
                      v-if="about.Atmosphere?.Cosy"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      Cosy
                    </div>
                    <div
                      v-if="about['Service options']?.Takeaway"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      Takeaway
                    </div>
                    <div
                      v-if="about['Service options']?.['Outdoor seating']"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      Outdoor seating
                    </div>
                    <div
                      v-if="about.Children?.['Good for kids']"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      <p>
                        {{
                          about.Children?.['Good for kids']
                            ? 'kids Friendly'
                            : ''
                        }}
                      </p>
                    </div>
                    <div
                      v-if="about.Offerings?.Coffee"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border-b rounded-full border-gray-300 bg-blue-500"
                    >
                      <p>
                        {{ about.Offerings?.Coffee ? 'Coffee' : '' }}
                      </p>
                    </div>
                    <div
                      v-if="about.Planning?.['Accepts reservations']"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border-b rounded-full border-gray-300 bg-blue-500"
                    >
                      <p>
                        {{
                          about.Planning?.['Accepts reservations']
                            ? 'Accepts reservations'
                            : ''
                        }}
                      </p>
                    </div>
                    <div
                      v-if="about.Highlights?.['Live music']"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      <p>
                        {{
                          about.Highlights?.['Live music'] ? 'Live music' : ''
                        }}
                      </p>
                    </div>
                    <div
                      v-if="about.Highlights?.['Live performances']"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      <p>
                        {{
                          about.Highlights?.['Live performances']
                            ? 'Live performances'
                            : ''
                        }}
                      </p>
                    </div>
                    <div
                      v-if="about.Payments?.['Credit cards']"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      <p>
                        {{
                          about.Payments?.['Credit cards'] ? 'Credit cards' : ''
                        }}
                      </p>
                    </div>
                    <div
                      v-if="about.Payments?.['Debit cards']"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      <p>
                        {{
                          about.Payments?.['Debit cards'] ? 'Debit cards' : ''
                        }}
                      </p>
                    </div>
                    <div
                      v-if="about.Payments?.['NFC mobile payments']"
                      class="px-3 py-2 flex text-white text-xs items-center gap-2 border rounded-full border-gray-300 bg-blue-500"
                    >
                      <p>
                        {{
                          about.Payments?.['NFC mobile payments']
                            ? 'NFC mobile payments'
                            : ''
                        }}
                      </p>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <p>No information available.</p>
                </div>
              </div>
              <!-- <div class="bg-white p-4 rounded-lg shadow-md mt-4">
              <h2 class="text-xl font-semibold">Cafe Features</h2>
  
              <h3 class="font-semibold">Service Options</h3>
              <ul>
                <li v-for="(value, key) in serviceOptions" :key="key">
                  {{ key }}: {{ value ? "Yes" : "No" }}
                </li>
              </ul>
  
              <h3 class="font-semibold">Highlights</h3>
              <ul>
                <li v-for="(value, key) in highlights" :key="key">
                  {{ key }}: {{ value ? "Yes" : "No" }}
                </li>
              </ul>
  
              <h3 class="font-semibold">Accessibility</h3>
              <ul>
                <li v-for="(value, key) in accessibility" :key="key">
                  {{ key }}: {{ value ? "Yes" : "No" }}
                </li>
              </ul>
            </div> -->
            </div>
          </div>
        </div>
        <div class="w-full md:w-1/2">
          <div class="flex flex-col" v-if="cafe.working_hours">
            <p>Working Hours</p>
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
                  v-for="(hours, day) in JSON.parse(cafe.working_hours)"
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
    </div>
    <div v-else class="text-center text-gray-500">Cafe not found.</div>
  </div>
   <!-- @budi section ini showing cafe yg realted dengan last search result - atau kalau bukan hasil search show close location dari cafe terpilih) -->
  <section id="related-cafes" class="my-4">
    <div class="my-4  w-full py-2 mx-auto flex flex-row gap-4 items-center justify-center bg-gray-200">
      <div
        class=" text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80">
        Cafe Terbaru 1
      </div>
      <div
        class=" text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80">
        Cafe Terbaru 2
      </div>
      <div
        class=" text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80">
        Cafe Terbaru 3
      </div>
      <div
        class=" text-gray-800 text-center font-medium tracking-wide mb-2 sm:mb-4 border border-gray-600 h-40 w-80">
        Cafe Terbaru 4
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useNuxtApp } from '#app';

  const route = useRoute();
  const cafe = ref(null);
  const loading = ref(true);
  const about = ref({});

  // New JSON string to be added to the About section
  const additionalAboutData =
    '{"Service options": {"Outdoor seating": true, "Takeaway": true, "Dine-in": true}, "Accessibility": {"Wheelchair-accessible car park": false, "Wheelchair-accessible entrance": false, "Wheelchair-accessible seating": false}, "Offerings": {"Coffee": true}, "Dining options": {"Seating": true}, "Amenities": {"Toilets": true}, "Atmosphere": {"Casual": true, "Cosy": true}, "Crowd": {"Groups": true}, "Children": {"Good for kids": true}}';

  function openInGoogleMaps() {
    // First priority: use location_link if available
    if (cafe.value?.location_link) {
      console.log('Using location_link');
      window.open(cafe.value.location_link, '_blank');
      return;
    }

    // Second priority: use place_id
    if (cafe.value?.place_id) {
      console.log('Using place_id');
      const url = `https://www.google.com/maps/place/?q=place_id:${cafe.value.place_id}`;
      window.open(url, '_blank');
      return;
    }

    // Third priority: use google_id
    if (cafe.value?.google_id) {
      console.log('Using google_id');
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cafe.value.name
      )}&query_place_id=${cafe.value.google_id}`;
      window.open(url, '_blank');
      return;
    }

    // Fallback: use coordinates if other options aren't available
    if (cafe.value?.latitude && cafe.value?.longitude) {
      console.log('Using coordinates as fallback');
      const lat = cafe.value.latitude.toString().replace(',', '.').trim();
      const lng = cafe.value.longitude.toString().replace(',', '.').trim();
      const url = `https://www.google.com/maps/search/${encodeURIComponent(
        cafe.value.name
      )}/@${lat},${lng},17z`;
      window.open(url, '_blank');
    } else {
      console.log('No location data available');
    }
  }

  function openWebsite() {
    if (cafe.value?.site) {
      window.open(cafe.value.site, '_blank');
    } else if (cafe.value?.instagram_url) {
      window.open(cafe.value.instagram_url, '_blank');
    }
  }

  onMounted(async () => {
    console.log('Route ID:', route.params.id);
    const { $supabase } = useNuxtApp();
    const { data: cafeData, error } = await $supabase
      .from('cafes')
      .select('*')
      .eq('id', route.params.id)
      .single();

    if (error) {
      console.error('Error fetching cafe details:', error);
    } else {
      console.log('Fetched Cafe Data:', cafeData);
      cafe.value = cafeData;

      // Check if cafeData.about is a string and parse it if necessary
      if (typeof cafeData.about === 'string') {
        about.value = JSON.parse(cafeData.about);
      } else {
        about.value = cafeData.about; // Assume it's already an object
      }

      // Merge additional data into the about object
      const additionalData = JSON.parse(additionalAboutData);
      Object.assign(about.value, additionalData);

      console.log('About Data:', about.value); // Check the structure of the about data
    }
    loading.value = false;
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
</style>
