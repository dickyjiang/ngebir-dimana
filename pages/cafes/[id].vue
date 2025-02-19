<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="text-center text-gray-500">Loading cafe details...</div>
    <div v-else-if="cafe">
      <h1 class="text-4xl font-bold mb-4">{{ cafe.name }}</h1>
      <div class="flex items-start justify-between gap-4">
        <div class="w-1/2">
          
          <NuxtImg :src="cafe.photo" alt="Cafe Image" class="w-full h-64 object-cover mb-4" />
          <div class="px-4">
            <div class="flex items-end gap-2 justify-between border-b border-gray-500 pb-3">
              <div class="w-12 h-12 rounded-full overflow-hidden">
                <NuxtImg :src="cafe.logo" alt="Cafe Logo" class="w-full h-full object-cover mb-4"/>
              </div>
              <div class="flex items-center justify-between gap-2 py-1">
                <div class="flex items-center gap-1">
                  <img src="/src/assets/img/city.svg" alt="location" class="h-4"> 
                  <p class="text-gray-500">{{ cafe.city }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-2">
                    <img src="/src/assets/img/rating.svg" alt="rating" class="h-4"> 
                    <p class="text-gray-500">{{ cafe.rating }}</p>
                  </div>
                  <p class="text-gray-500 font-semibold">{{ cafe.range }}</p>
                </div>
              </div>
            </div>
            <p class="text-lg text-gray-700 my-2">{{ cafe.description }}</p>
            <div class="flex flex-col ">
              <p>Working Hours</p>
              <table class="min-w-full border-collapse border border-gray-300 text-sm mt-2">
                <thead>
                  <tr>
                    <th class="border border-gray-300 px-4 py-2">Day</th>
                    <th class="border border-gray-300 px-4 py-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(hours, day) in JSON.parse(cafe.working_hours)" :key="day">
                    <td class="border border-gray-300 px-4 py-2">{{ day }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ hours }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex items-center gap-2 py-2">
              <button class="text-gray-500 border border-gray-500 px-2 py-1 text-sm rounded-full">
                <p>{{ cafe.borough }}</p>
              </button>
              <!-- Repeat buttons for other boroughs if necessary -->
            </div>
          </div>
        </div>
        <div class="w-1/2 bg-gray-100">
          <div>
            <p>About</p>
            <div v-if="about">
              <p>{{ about.basic_info }}</p>
              <p><strong>Ambiance:</strong> {{ about.ambiance }}</p>
              <p>
                <strong>Specialties:</strong> 
                {{ Array.isArray(about.specialties) ? about.specialties.join(', ') : 'N/A' }}
              </p>
              <p><strong>Community Engagement:</strong> {{ about.community_engagement }}</p>
              <p><strong>Customer Experience:</strong> {{ about.customer_experience }}</p>
            </div>
            <div v-else>
              <p>No information available.</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-md mt-4">
        <h2 class="text-xl font-semibold">Cafe Features</h2>
        
        <h3 class="font-semibold">Service Options</h3>
        <ul>
          <li v-for="(value, key) in serviceOptions" :key="key">{{ key }}: {{ value ? 'Yes' : 'No' }}</li>
        </ul>

        <h3 class="font-semibold">Highlights</h3>
        <ul>
          <li v-for="(value, key) in highlights" :key="key">{{ key }}: {{ value ? 'Yes' : 'No' }}</li>
        </ul>

        <h3 class="font-semibold">Accessibility</h3>
        <ul>
          <li v-for="(value, key) in accessibility" :key="key">{{ key }}: {{ value ? 'Yes' : 'No' }}</li>
        </ul>

        <!-- Repeat for other sections like Offerings, Dining Options, etc. -->
      </div>
          </div>
        </div>
      </div>
      
    </div>
    <div v-else class="text-center text-gray-500">Cafe not found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useNuxtApp } from '#app'

const route = useRoute()
const cafe = ref(null)
const loading = ref(true)
const about = ref({})

const features = {
  "Service options": { "Outdoor seating": true, "No-contact delivery": true, "Delivery": true, "On-site services": true, "Takeaway": true, "Dine-in": true },
  "Highlights": { "Live music": true },
  "Accessibility": { "Wheelchair-accessible entrance": true, "Wheelchair-accessible seating": true, "Wheelchair-accessible toilet": true },
  "Offerings": { "Coffee": true, "Halal food": true },
  "Dining options": { "Breakfast": true, "Brunch": true, "Lunch": true, "Dinner": true, "Catering": true, "Dessert": true, "Seating": true },
  "Amenities": { "Toilets": true },
  "Atmosphere": { "Casual": true, "Cosy": true },
  "Crowd": { "Groups": true },
  "Planning": { "Accepts reservations": true },
  "Payments": { "Credit cards": true, "Debit cards": true },
  "Children": { "Good for kids": true, "Good for kids birthday": true, "High chairs": true, "Kids' menu": true },
  "Parking": { "Free of charge street parking": true, "Paid parking lot": true, "Paid street parking": true, "Parking": true }
}

const { serviceOptions, highlights, accessibility, offerings, diningOptions, amenities, atmosphere, crowd, planning, payments, children, parking } = features;

onMounted(async () => {
  console.log('Route ID:', route.params.id)
  const { $supabase } = useNuxtApp()
  const { data: cafeData, error } = await $supabase
    .from('cafes')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (error) {
    console.error('Error fetching cafe details:', error)
  } else {
    console.log('Fetched Cafe Data:', cafeData)
    cafe.value = cafeData
    about.value = JSON.parse(cafeData.about)
  }
  loading.value = false
})
</script> 