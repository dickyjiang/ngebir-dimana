<template>
  <div class="max-w-6xl mx-auto">
    <section>
      <h1 class="text-2xl font-semibold">Cafe Owner Page</h1>
      <p>Welcome to the Cafe Owner page!</p>
      <p>
        Here you can manage your cafe's information and view customer feedback.
      </p>
    </section>
    <section>
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div>
          <h2>Manage Cafe Information</h2>
          <p>
            Update your cafe's details, including name, location, and menu
            items.
          </p>
        </div>
        <div class="mt-10">
          <form class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col space-y-2 mb-4">
              <label for="cafeName">Cafe Name:</label>
              <input
                class="input-base"
                type="text"
                id="cafeName"
                name="cafeName"
                required
              />
            </div>
            <div class="flex flex-col mb-4">
              <label for="cafeImage">Cafe Image:</label>
              <input
                type="file"
                id="cafeImage"
                name="cafeImage"
                accept="image/*"
              />
            </div>

            <div>
              <label for="location">Location:</label>
              <input
                class="input-base"
                type="text"
                id="location"
                name="location"
                required
              />
            </div>

            <div class="flex flex-col mb-4">
              <label for="description">Description:</label>
              <textarea id="description" name="description" required></textarea>
            </div>
            <div>
              <label for="openingHours">Opening Hours:</label>
              <input
                class="input-base"
                type="text"
                id="openingHours"
                name="openingHours"
                placeholder="e.g., Mon-Fri: 8am - 8pm"
                required
              />
            </div>
            <div>
              <label for="menuItems">Menu Items:</label>
              <textarea id="menuItems" name="menuItems" required></textarea>
            </div>

            <button type="submit">Update Cafe Information</button>
          </form>
        </div>
      </div>
    </section>
    <section>
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2>Customer Feedback</h2>
        <p>View and respond to customer feedback.</p>
        <ul>
          <li>Feedback 1: Great coffee!</li>
          <li>Feedback 2: Friendly staff!</li>
          <li>Feedback 3: Cozy atmosphere!</li>
        </ul>
      </div>
    </section>
    <section>
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2>Analytics</h2>
        <p>View analytics about your cafe's performance.</p>
        <ul>
          <li>Total Sales: $5000</li>
          <li>Customer Visits: 200</li>
          <li>Average Rating: 4.5/5</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FormErrors {
  cafeName: string[]
  location: string[]
  openingHours: string[]
  description: string[]
  menuItems: string[]
}

const formErrors = ref<FormErrors>({
  cafeName: [],
  location: [],
  openingHours: [],
  description: [],
  menuItems: []
})

const hasError = (field: keyof FormErrors): boolean => {
  return formErrors.value[field].length > 0
}
</script>

<style scoped>
.input-base {
  @apply pl-2 py-1 border rounded-sm bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200;
  outline: none;
  width: 100%;
}

.input-base:hover {
  @apply border-gray-400;
}

.input-base:focus {
  @apply bg-white;
}

.input-error {
  @apply border-red-500 bg-red-50;
}
</style>
