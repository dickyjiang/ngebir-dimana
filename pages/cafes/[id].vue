<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="text-center text-gray-500">
      Loading cafe details...
    </div>
    <div v-else-if="cafe">
      <h1 class="text-4xl font-bold mb-4">{{ cafe.name }}</h1>
      <div class="flex items-start justify-between gap-4">
        <div class="w-1/2">
          <NuxtImg
            :src="cafe.photo"
            alt="Cafe Image"
            class="w-full h-64 object-cover mb-4"
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
            <p class="text-lg text-gray-700 my-2">{{ cafe.description }}</p>
            <div class="flex flex-col">
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
            <div class="flex items-center gap-2 py-2">
              <button
                class="text-gray-500 border border-gray-500 px-2 py-1 text-sm rounded-full"
              >
                <p>{{ cafe.borough }}</p>
              </button>
              <!-- Repeat buttons for other boroughs if necessary -->
            </div>
          </div>
        </div>
        <div class="w-1/2 bg-gray-100">
          <div>
            <p>About</p>
            <div v-if="about && Object.keys(about).length">
              <table class="min-w-full border-collapse border border-gray-300 text-sm mt-2">
                <thead>
                  <tr>
                    <th class="border border-gray-300 px-4 py-2">Property</th>
                    <th class="border border-gray-300 px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Crowd - Groups</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Crowd.Groups ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Children - Good for kids</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Children["Good for kids"] ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Planning - Accepts reservations</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Planning["Accepts reservations"] ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Amenities - Toilets</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Amenities.Toilets ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Service options - Outdoor seating</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about["Service options"]["Outdoor seating"] ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Service options - Takeaway</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about["Service options"].Takeaway ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Service options - Dine-in</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about["Service options"]["Dine-in"] ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Accessibility - Wheelchair-accessible car park</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Accessibility["Wheelchair-accessible car park"] ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Accessibility - Wheelchair-accessible entrance</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Accessibility["Wheelchair-accessible entrance"] ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Accessibility - Wheelchair-accessible seating</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Accessibility["Wheelchair-accessible seating"] ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Offerings - Coffee</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Offerings.Coffee ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Dining options - Seating</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about["Dining options"].Seating ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Atmosphere - Casual</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Atmosphere.Casual ? "Yes" : "No" }}</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">Atmosphere - Cosy</td>
                    <td class="border border-gray-300 px-4 py-2">{{ about.Atmosphere.Cosy ? "Yes" : "No" }}</td>
                  </tr>
                </tbody>
              </table>
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
    <div v-else class="text-center text-gray-500">Cafe not found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useNuxtApp } from "#app";

const route = useRoute();
const cafe = ref(null);
const loading = ref(true);
const about = ref({});

// New JSON string to be added to the About section
const additionalAboutData = "{\"Service options\": {\"Outdoor seating\": true, \"Takeaway\": true, \"Dine-in\": true}, \"Accessibility\": {\"Wheelchair-accessible car park\": false, \"Wheelchair-accessible entrance\": false, \"Wheelchair-accessible seating\": false}, \"Offerings\": {\"Coffee\": true}, \"Dining options\": {\"Seating\": true}, \"Amenities\": {\"Toilets\": true}, \"Atmosphere\": {\"Casual\": true, \"Cosy\": true}, \"Crowd\": {\"Groups\": true}, \"Children\": {\"Good for kids\": true}}";

onMounted(async () => {
  console.log("Route ID:", route.params.id);
  const { $supabase } = useNuxtApp();
  const { data: cafeData, error } = await $supabase
    .from("cafes")
    .select("*")
    .eq("id", route.params.id)
    .single();

  if (error) {
    console.error("Error fetching cafe details:", error);
  } else {
    console.log("Fetched Cafe Data:", cafeData);
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

    console.log("About Data:", about.value); // Check the structure of the about data
  }
  loading.value = false;
});
</script>
