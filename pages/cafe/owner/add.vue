<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="max-w-6xl mx-auto px-[5%]">
      <section class="pt-6 mb-8">
        <h1 class="text-2xl font-semibold mb-4">Cafe Owner Page</h1>
        <p class="text-gray-700 mb-4">
          Silahkan menambah atau mengedit informasi cafe Anda. Pastikan semua
          informasi yang Anda masukkan adalah benar dan sesuai dengan cafe Anda.
          Jika Anda memiliki pertanyaan atau masalah, silahkan hubungi
          <a href="mailto:admin@ngopi.di-mana.com">admin</a>
        </p>
      </section>
      <section class="mb-8">
        <div class="bg-white shadow-md rounded px-4 pt-2 pb-8 mb-8">
          <div class="mt-10">
            <form>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-0">
                <div
                  class="border-b sm:border-b-0 border-r-0 sm:border-r border-gray-300 px-4"
                >
                  <div class="mb-8">
                    <label for="cafeName">Nama Cafe:</label>
                    <input
                      class="input-base"
                      :class="{ 'input-error': hasError('cafeName') }"
                      type="text"
                      id="cafeName"
                      name="cafeName"
                      v-model="cafeName"
                      @input="validateOnChangeForm"
                      required
                    />
                    <span
                      v-if="hasError('cafeName')"
                      class="text-red-500 text-sm"
                    >
                      {{ formErrors.cafeName.join(', ') }}
                    </span>
                    <p class="text-gray-500 text-sm mt-1">
                      <strong>Note:</strong> Ini adalah nama cafe Anda. Pastikan
                      Nama cafe yang akan ditampilkan di aplikasi. Pastikan nama
                      ini sesuai dengan nama cafe Anda.
                    </p>
                  </div>
                  <div class="mb-8">
                    <label for="street">Alamat Cafe:</label>
                    <input
                      class="input-base"
                      :class="{ 'input-error': hasError('street') }"
                      type="text"
                      id="street"
                      name="street"
                      v-model="cafeStreet"
                      required
                    />
                    <span
                      v-if="hasError('street')"
                      class="text-red-500 text-sm"
                    >
                      {{ formErrors.street.join(', ') }}
                    </span>
                  </div>
                  <div class="mb-8">
                    <label for="description">Deskripsi:</label>
                    <textarea
                      class="input-base"
                      :class="{ 'input-error': hasError('description') }"
                      id="description"
                      name="description"
                      required
                      v-model="cafeDescription"
                    ></textarea>
                    <span
                      v-if="hasError('description')"
                      class="text-red-500 text-sm"
                    >
                      {{ formErrors.description.join(', ') }}
                    </span>
                    <p class="text-gray-500 text-sm mt-1">
                      <strong>Note:</strong> Ini adalah deskripsi cafe Anda.
                      Pastikan deskripsi yang akan ditampilkan di aplikasi.
                      Pastikan deskripsi ini sesuai dengan deskripsi cafe Anda.
                    </p>
                  </div>
                  <div class="mb-8">
                    <label for="site">Website atau Instagram:</label>
                    <input
                      class="input-base"
                      :class="{ 'input-error': hasError('site') }"
                      type="url"
                      id="site"
                      name="site"
                      required
                      v-model="cafeSite"
                    />
                    <span v-if="hasError('site')" class="text-red-500 text-sm">
                      {{ formErrors.site.join(', ') }}
                    </span>
                    <p class="text-gray-500 text-sm mt-1">
                      <strong>Note:</strong> Untuk menghindari kesalahan,
                      pastikan untuk menyalin tautan (copy & paste) dari
                      aplikasi Instagram atau website Anda.
                    </p>
                  </div>
                  <div class="mb-8">
                    <label for="phone">Phone:</label>
                    <input
                      class="input-base"
                      :class="{ 'input-error': hasError('phone') }"
                      type="tel"
                      id="phone"
                      name="phone"
                      v-model="phoneNumber"
                      @input="formatPhoneNumber"
                      placeholder="+62 "
                      required
                    />
                    <span v-if="hasError('phone')" class="text-red-500 text-sm">
                      {{ formErrors.phone.join(', ') }}
                    </span>
                  </div>
                  <div class="flex gap-4">
                    <div class="mb-8">
                      <label for="state">Provinsi / Kota Besar:</label>
                      <select
                        class="input-base"
                        :class="{ 'input-error': hasError('state') }"
                        id="state"
                        name="state"
                        v-model="selectedParentCity"
                        @change="validateOnChangeForm"
                        required
                      >
                        <option value="" disabled>
                          Pilih Provinsi/Kota Besar
                        </option>
                        <option
                          v-for="city in parentCities"
                          :key="city.city_slug"
                          :value="city.city_slug"
                        >
                          {{ city.city_name }}
                        </option>
                      </select>
                      <span v-if="hasError('state')" class="text-red-500 text-sm">
                        {{ formErrors.state.join(', ') }}
                      </span>
                    </div>
  
                    <!-- Replace the city select -->
                    <div class="flex flex-col sm:flex-row gap-2">
                      <div class="mb-8">
                        <label for="city">Kota / Kabupaten:</label>
                        <select
                          class="input-base"
                          :class="{ 'input-error': hasError('city') }"
                          id="city"
                          name="city"
                          v-model="selectedChildCity"
                          required
                          @change="validateOnChangeForm"
                          :disabled="!selectedParentCity"
                        >
                          <option value="" disabled>Pilih Kota/Kabupaten</option>
                          <option
                            v-for="city in availableChildCities"
                            :key="city.city_slug"
                            :value="city.city_slug"
                          >
                            {{ city.city_name }}
                          </option>
                        </select>
                        <span
                          v-if="hasError('city')"
                          class="text-red-500 text-sm"
                        >
                          {{ formErrors.city.join(', ') }}
                        </span>
                      </div>
  
                      <!-- <div class="mb-8">
                        <label for="postal_code">Kode Pos:</label>
                      </div> -->
                    </div>

                  </div>
                  <div class="mb-8">
                    <label for="">location_link:</label>
                    <input
                      class="input-base"
                      :class="{ 'input-error': hasError('location_link') }"
                      type="text"
                      id="location_link"
                      name="location_link"
                      v-model="locationLink"
                      required
                      @input="validateOnChangeForm"
                    />
                    <p class="text-gray-500 text-sm mt-2">Masukan tautan URL (URL link) dari Google Business anda disini (diawalin dengan: <span class="font-semibold text-gray-700">https://maps.app.goo.gl/</span>)</p>
                    <div class="flex flex-col items-center mt-2 border bg-gray-100 border-gray-300 rounded-md px-3 py-2">
                      <p class="text-gray-500 text-sm ">Click untuk panduan cara menemukan Google location_link anda</p> 
                      <button 
                        @click="showPopup = true" 
                        type="button"
                        class="text-sm rounded-lg border border-gray-400 mt-3 text-gray-500 px-3 py-2"
                      >
                        Cara mendapatkan Google location_link
                      </button>
                      <div v-if="showPopup" class="popup" @click.self="showPopup = false">
                        <div class="popup-content">
                          <span class="close-btn" @click="showPopup = false">&times;</span>
                          <img src="/public/img/tutorial_location_link.png" alt="Tutorial Location" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="px-4">
                  <div class="mb-8">
                    <label for="logo">Logo Cafe:</label>
                    <div class="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div class="space-y-1 text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div class="flex items-center flex-col text-sm text-gray-600">
                          <label for="logo" class="relative cursor-pointer rounded font-medium text-gray-800 hover:text-gray-500 ">
                            <span>Upload a file</span>
                            <input 
                              type="file" 
                              id="logo" 
                              name="logo"
                              accept="image/*"
                              required
                              @change="handleLogoUpload"
                              class="sr-only"
                            />
                          </label>
                        </div>
                        <p class="text-xs text-gray-500">JPG, JPEG, PNG and WEBP up to 5MB</p>
                      </div>
                    </div>
                    <span v-if="hasError('logo')" class="text-red-500 text-sm">
                      {{ formErrors.logo.join(', ') }}
                    </span>
                    <!-- Logo preview section -->
                    <div v-if="logoPreview" class="mt-4">
                      <div class="relative inline-block">
                        <img
                          :src="logoPreview"
                          class="w-32 h-32 object-cover rounded-lg"
                          alt="Logo preview"
                        />
                        <button
                          @click="removeLogo"
                          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col space-y-2 mb-8">
                    <label for="cafeImage">Photo Cafe:</label>
                    <div class="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div class="space-y-1 text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div class="flex flex-col items-center text-sm text-gray-600">
                          <label for="cafeImage" class="relative cursor-pointer rounded-md font-medium text-gray-800 hover:text-gray-500 ">
                            <span>Upload files</span>
                            <input
                              type="file"
                              id="cafeImage"
                              name="cafeImage"
                              accept="image/*"
                              multiple
                              @change="handleImageUpload"
                              class="sr-only"
                            />
                          </label>
                        </div>
                        <p class="text-xs text-gray-500">JPG, JPEG, PNG and WEBP up to 20MB</p>
                      </div>
                    </div>

                    <!-- Display validation errors -->
                    <div v-if="imageErrors.length > 0" class="text-red-500 text-sm mt-2">
                      <p v-for="(error, index) in imageErrors" :key="index">
                        {{ error }}
                      </p>
                    </div>

                    <!-- Image preview section -->
                    <div v-if="imagePreviews.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div v-for="(preview, index) in imagePreviews" :key="index" class="relative">
                        <img
                          :src="preview"
                          class="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          @click="removeImage(index)"
                          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="mb-10">
                    <label for="features">Features:</label>
                    <div class="relative mt-2">
                      <div class="hs-dropdown  relative w-full">
                        <div
                          class="flex flex-wrap items-center border border-gray-300 rounded-md p-2 bg-white"
                        >
                          <!-- Selected tags -->
                          <div
                            v-for="feature in selectedFeatures"
                            :key="feature.id"
                            class="inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            <span>{{ feature.name }}</span>
                            <button
                              type="button"
                              class="flex-shrink-0 ml-1 h-4 w-4 inline-flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:bg-blue-200 focus:text-blue-800"
                              @click="removeSelectedFeature(feature)"
                            >
                              <span class="sr-only">Remove feature</span>
                              <svg
                                class="h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>

                          <!-- Search input -->
                          <input
                            type="text"
                            id="features-search"
                            class="flex-grow min-w-[80px] border-0 p-0 pl-1 focus:ring-0 focus:outline-none text-sm"
                            placeholder="Search and select features..."
                            v-model="featureSearchQuery"
                            @input="searchFeatures"
                            @focus="showFeatureDropdown = true"
                            @blur="handleBlur"
                            @keydown.down="focusNextDropdownItem"
                            @keydown.up="focusPreviousDropdownItem"
                            @keydown.enter.prevent="selectFocusedFeature"
                            @keydown.escape="hideDropdown"
                          />
                        </div>

                        <!-- Dropdown -->
                        <div
                          v-if="
                            showFeatureDropdown && filteredFeatures.length > 0
                          "
                          class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                          ref="dropdownRef"
                        >
                          <div
                            v-for="(feature, index) in filteredFeatures"
                            :key="feature.id"
                            :class="[
                              'px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center',
                              focusedFeatureIndex === index ? 'bg-blue-50' : '',
                              isFeatureSelected(feature) ? 'bg-blue-100' : '',
                            ]"
                            @click="handleFeatureClick(feature)"
                            @mouseover="focusedFeatureIndex = index"
                            :id="`feature-item-${index}`"
                          >
                            <div class="flex-shrink-0 mr-2">
                              <svg
                                class="h-4 w-4 text-blue-600"
                                v-if="isFeatureSelected(feature)"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            </div>
                            <span>{{ feature.name }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p class="text-gray-500 text-sm mt-2">
                      <strong>Note:</strong> Pilih semua fitur yang sesuai dengan café anda.
                    </p>
                  </div>

                  <div class="mb-8">
                    <label class="block mb-4">Working Hours:</label>
                    <div class="flex flex-col space-y-4">
                      <div
                        v-for="day in days"
                        :key="day.id"
                        class="border-b pb-4 last:border-b-0"
                      >
                        <div class="flex items-center justify-between">
                          <span class="font-medium">{{ day.name }}</span>
                          <div class="flex items-center space-x-4">
                            <label
                              class="relative inline-flex items-center cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                v-model="day.isOpen"
                                class="sr-only peer"
                              />
                              <div
                                class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                              ></div>
                            </label>
                            <span class="text-gray-600">{{
                              day.isOpen ? 'Open' : 'Closed'
                            }}</span>
                          </div>
                        </div>

                        <div
                          v-if="day.isOpen"
                          class="flex items-center space-x-6 pl-4 mt-4"
                        >
                          <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-600">Opens at</span>
                            <select
                              v-model="day.openTime"
                              class="input-base py-1 px-2"
                            >
                              <option
                                v-for="time in timeOptions"
                                :key="time.value"
                                :value="time.value"
                              >
                                {{ time.label }}
                              </option>
                            </select>
                          </div>
                          <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-600">Closes at</span>
                            <select
                              v-model="day.closeTime"
                              class="input-base py-1 px-2"
                            >
                              <option
                                v-for="time in timeOptions"
                                :key="time.value"
                                :value="time.value"
                              >
                                {{ time.label }}
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <div class="flex justify-center sm:justify-end px-8 mt-8">
              <!-- hasAnyErrors:{{ hasAnyErrors() }} isSubmitting:{{ isSubmitting }} -->
              <button
                class="text-black font-semibold border border-black px-4 py-2 rounded-full relative"
                type="submit"
                @click="submitForm"
                :disabled="isSubmitting || hasAnyErrors()"
                :class="{ 'opacity-50 cursor-not-allowed': hasAnyErrors() }"
              >
                <span :class="{ 'opacity-0': isSubmitting }">
                  Submit Cafe Information
                </span>
                <div
                  v-if="isSubmitting"
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <svg
                    class="animate-spin h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
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
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
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
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  // Import the new composable
  import { useFetchFeatures } from '~/composables/useFetchFeatures';

  // Define Feature interface
  interface Feature {
    id: number;
    name: string | null;
    feature_slug: string | null;
  }

  interface FormErrors {
    cafeName: string[];
    description: string[];
    menuItems: string[];
    site: string[];
    phone: string[];
    full_address: string[];
    borough: string[];
    street: string[];
    city: string[];
    postal_code: string[];
    state: string[];
    lat: string[];
    long: string[];
    rating: string[];
    logo: string[];
    location_link: string[];
  }

  const formErrors = ref<FormErrors>({
    cafeName: [],
    description: [],
    menuItems: [],
    site: [],
    phone: [],
    full_address: [],
    borough: [],
    street: [],
    city: [],
    postal_code: [],
    state: [],
    lat: [],
    long: [],
    location_link: [],
    rating: [],
    logo: [],
  });

  interface ChildCity {
    city_name: string;
    city_slug: string;
  }

  interface ParentCity {
    city_name: string;
    city_slug: string;
    childCities: ChildCity[];
  }

  const isSubmitting = ref(false);

  // Replace previous province/city refs
  const parentCities = ref<ParentCity[]>([]);
  const selectedParentCity = ref('');
  const selectedChildCity = ref('');
  const availableChildCities = ref<ChildCity[]>([]);
  // Add these to your ref declarations
  const cafeName = ref('');
  const locationLink = ref('');
  const cafeDescription = ref('');
  const cafeStreet = ref('');
  const cafeSite = ref('');

  const citiesByProvince = ref([]);

  const selectedProvince = ref('');
  const selectedCity = ref('');
  const availableCities = ref<string[]>([]);
  const logoFile = ref<File | null>(null);
  const logoPreview = ref<string | null>(null);

  // Add this method to handle logo uploads
  const handleLogoUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Clear previous errors
    formErrors.value.logo = [];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      formErrors.value.logo.push(`${file.name} is not an image file.`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      formErrors.value.logo.push(
        `${file.name} exceeds the 5MB file size limit.`
      );
      return;
    }

    // Store the file
    logoFile.value = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add method to remove logo
  const removeLogo = () => {
    logoPreview.value = null;
    logoFile.value = null;
    // Reset the file input
    const input = document.getElementById('logo') as HTMLInputElement;
    if (input) input.value = '';
  };
  const fetchCityData = async () => {
    try {
      const response = await fetch('/api/city/parent');
      const data = await response.json();
      parentCities.value = data.parentCities || [];
    } catch (error) {
      console.error('Error fetching city data:', error);
    }
  };
  const validateOnChangeForm = () => {
    // Clear previous errors for this field
    formErrors.value.cafeName = [];
    formErrors.value.state = [];
    formErrors.value.city = [];
    formErrors.value.location_link = [];
    imageErrors.value = [];

    // Validate the café name
    if (!cafeName.value || cafeName.value.trim() === '') {
      formErrors.value.cafeName.push('Nama cafe tidak boleh kosong');
    }
  };
  onMounted(async () => {
    fetchCityData();
    // Fetch features data when the component mounts
    searchFeatures();
    // Show all features initially in the dropdown when input is focused
    filteredFeatures.value = allFeatures.value;
  });

  // Add this watch effect to automatically generate the slug when cafeName changes
  // Add these after other ref imports
  const imagePreviews = ref<string[]>([]);
  const uploadedImages = ref<File[]>([]);

  const imageFiles = ref<File[]>([]); // Store the actual File objects
  const imageErrors = ref<string[]>([]); // Store validation errors
  const imageUploadProgress = ref<number[]>([]); // Track upload progress
  const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
  const maxImageCount = 5; // Maximum number of images allowed
  // Add this function to your script section

  const updateAvailableChildCities = () => {
    selectedChildCity.value = '';
    if (selectedParentCity.value) {
      const parent = parentCities.value.find(
        (p) => p.city_slug === selectedParentCity.value
      );
      availableChildCities.value = parent?.childCities || [];
    } else {
      availableChildCities.value = [];
    }
  };

  // Add these methods before the component ends
  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    // Clear previous errors
    imageErrors.value = [];

    // Check if adding these files would exceed the maximum
    if (imageFiles.value.length + files.length > maxImageCount) {
      imageErrors.value.push(
        `You can upload a maximum of ${maxImageCount} images.`
      );
      return;
    }

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        imageErrors.value.push(`${file.name} is not an image file.`);
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        imageErrors.value.push(`${file.name} exceeds the 5MB file size limit.`);
        return;
      }

      // Add file to our array
      imageFiles.value.push(file);
      imageUploadProgress.value.push(0);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviews.value.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });

    // Clear the input to allow selecting the same files again if needed
    input.value = '';
  };

  const removeImage = (index: number) => {
    imagePreviews.value.splice(index, 1);
    imageFiles.value.splice(index, 1);
    imageUploadProgress.value.splice(index, 1);
  };

  const hasError = (field: keyof FormErrors): boolean => {
    return formErrors.value[field].length > 0;
  };
  const hasAnyErrors = (): boolean => {
    // Check if any field has errors
    return Object.values(formErrors.value).some((errors) => errors.length > 0);
  };
  const phoneNumber = ref('+62 '); // Initialize with space

  const formatPhoneNumber = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Handle backspace by checking if the value is just "+62 "
    if (value === '+62 ' || value === '+62') {
      phoneNumber.value = '+62 ';
      return;
    }

    // Remove non-digits except the plus sign and space
    value = value.replace(/[^\d+\s]/g, '');

    // If empty or just a plus, reset to "+62 "
    if (!value || value === '+') {
      phoneNumber.value = '+62 ';
      return;
    }

    // Ensure the number starts with "+62 "
    if (!value.startsWith('+62 ')) {
      // If user is typing without +62, add it
      value = value.replace(/^\+?62\s?|^0+/, ''); // Remove existing +62 or leading zeros
      phoneNumber.value = '+62 ' + value;
    } else {
      phoneNumber.value = value;
    }
  };

  const updateAvailableCities = () => {
    selectedCity.value = ''; // Reset selected city
    console.log('Selected Province:', selectedProvince.value);
    if (selectedProvince.value) {
      availableCities.value =
        citiesByProvince.value[selectedProvince.value] || [];
    } else {
      availableCities.value = [];
    }
  };

  //   watch(selectedProvince, updateAvailableCities);

  watch(selectedProvince, updateAvailableCities);
  watch(selectedParentCity, updateAvailableChildCities);

  interface DaySchedule {
    id: string;
    name: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }

  const days = ref([
    {
      id: 'sunday',
      name: 'Sunday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'monday',
      name: 'Monday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'tuesday',
      name: 'Tuesday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'wednesday',
      name: 'Wednesday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'thursday',
      name: 'Thursday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'friday',
      name: 'Friday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'saturday',
      name: 'Saturday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
  ]);

  const generateTimeOptions = () => {
    const options = [{ value: '24', label: '24 hours' }];

    for (let hour = 0; hour < 24; hour++) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';

      // Full hour
      options.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour12}:00 ${period}`,
      });

      // Half hour
      options.push({
        value: `${hour.toString().padStart(2, '0')}:30`,
        label: `${hour12}:30 ${period}`,
      });
    }

    return options;
  };

  const timeOptions = ref(generateTimeOptions());

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset all previous errors
    Object.keys(formErrors.value).forEach((key) => {
      formErrors.value[key as keyof FormErrors] = [];
    });

    // Validate cafe name
    if (!cafeName.value || cafeName.value.trim() === '') {
      formErrors.value.cafeName.push('Nama cafe tidak boleh kosong');
      isValid = false;
    }

    if (!selectedParentCity.value) {
      formErrors.value.state.push('Provinsi/Kota Besar tidak boleh kosong');
      isValid = false;
    }
    if (!selectedChildCity.value) {
      formErrors.value.city.push('Kota/Kabupaten tidak boleh kosong');
      isValid = false;
    }
    if (!locationLink.value) {
      formErrors.value.location_link.push('Location link tidak boleh kosong');
      isValid = false;
    }

    if (!imageFiles.value.length) {
      imageErrors.value.push(
        'Gambar cafe tidak boleh kosong. Silakan pilih file gambar.'
      );
      isValid = false;
    } else {
      imageFiles.value.forEach((file) => {
        if (!file.type.startsWith('image/')) {
          formErrors.value.logo.push(`${file.name} bukan file gambar`);
          isValid = false;
        }
        if (file.size > maxFileSize) {
          formErrors.value.logo.push(`${file.name} melebihi batas ukuran 5MB`);
          isValid = false;
        }
      });
    }
    return isValid;
  };
  const submitForm = async () => {
    // Validate the form first
    if (!validateForm()) {
      // Form is invalid, don't proceed with submission
      return;
    }

    // Create form data with parent and child city information
    isSubmitting.value = true;

    const formData = new FormData();

    formData.append('parentCity', selectedParentCity.value);
    formData.append('childCity', selectedChildCity.value);

    // Append city names
    const parentCityName = parentCities.value.find(
      (p) => p.city_slug === selectedParentCity.value
    )?.city_name;
    const childCityName = availableChildCities.value.find(
      (c) => c.city_slug === selectedChildCity.value
    )?.city_name;

    formData.append('cafeName', cafeName.value);
    formData.append('cafeStreet', cafeStreet.value);
    formData.append('cafeDescription', cafeDescription.value);
    formData.append('cafeSite', cafeSite.value);
    formData.append('cafePhoneNumber', phoneNumber.value);
    formData.append('cafeCity', childCityName || '');
    formData.append('cafeState', parentCityName || '');
    formData.append('cafeLocationLink', locationLink.value);

    if (logoFile.value) {
      formData.append('cafeLogo', logoFile.value);
    }

    if (imageFiles.value.length > 0) {
      formData.append('image', imageFiles.value[0]);

      for (let i = 1; i < imageFiles.value.length; i++) {
        formData.append('images', imageFiles.value[i]);
      }
    }
    formData.append('cafeWorkingHours', JSON.stringify(days.value));

    // Submit the form
    // ...
    try {
      // Simulate form submission
      console.log('Form submitted:', formData);
      const data = await fetch('/api/cafe/owner', {
        method: 'POST',
        body: formData,
      });
      if (!data.ok) {
        throw new Error('Network response was not ok');
      } else {
        navigateTo('/cafe/owner/list');
        // Handle success
      }
      // Reset the form or show success message
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      isSubmitting.value = false;
    }
  };

  const { features } = await useFetchFeatures();
  const allFeatures = ref<Feature[]>(features || []);

  const featureSearchQuery = ref('');
  const showFeatureDropdown = ref(false);
  const filteredFeatures = ref<Feature[]>([]);
  const selectedFeatures = ref<Feature[]>([]);
  const dropdownRef = ref<HTMLElement | null>(null);
  const focusedFeatureIndex = ref(-1);

  // Update searchFeatures function to work with the actual data structure
  const searchFeatures = () => {
    if (featureSearchQuery.value.trim() === '') {
      filteredFeatures.value = allFeatures.value;
    } else {
      filteredFeatures.value = allFeatures.value.filter((feature) =>
        feature.name
          ?.toLowerCase()
          .includes(featureSearchQuery.value.toLowerCase())
      );
    }
  };

  const toggleFeatureSelection = (feature: Feature) => {
    const index = selectedFeatures.value.findIndex(
      (selected) => selected.id === feature.id
    );
    if (index === -1) {
      selectedFeatures.value.push(feature);
    } else {
      selectedFeatures.value.splice(index, 1);
    }
  };

  const isFeatureSelected = (feature: Feature): boolean => {
    return selectedFeatures.value.some(
      (selected) => selected.id === feature.id
    );
  };

  const removeSelectedFeature = (feature: Feature) => {
    const index = selectedFeatures.value.findIndex(
      (selected) => selected.id === feature.id
    );
    if (index !== -1) {
      selectedFeatures.value.splice(index, 1);
    }
  };

  const handleBlur = (event: FocusEvent) => {
    // Use a small timeout to allow click events on dropdown items to finish
    // before determining if we should hide the dropdown
    setTimeout(() => {
      // Check if the active element is not the input or any dropdown item
      if (
        !document
          .getElementById('features-search')
          ?.contains(document.activeElement) &&
        !dropdownRef.value?.contains(document.activeElement)
      ) {
        showFeatureDropdown.value = false;
      }
    }, 150);
  };

  // Add click handler to dropdown items to prevent immediate closure
  const handleFeatureClick = (feature: Feature) => {
    toggleFeatureSelection(feature);
    // Clear the search input after selection
    featureSearchQuery.value = '';
    // Keep focus on the input to prevent dropdown from closing
    document.getElementById('features-search')?.focus();
    // Refresh the available features to show all options again
    filteredFeatures.value = allFeatures.value;
  };

  const focusNextDropdownItem = () => {
    if (filteredFeatures.value.length === 0) return;
    focusedFeatureIndex.value =
      (focusedFeatureIndex.value + 1) % filteredFeatures.value.length;
    scrollToFocusedItem();
  };

  const focusPreviousDropdownItem = () => {
    if (filteredFeatures.value.length === 0) return;
    focusedFeatureIndex.value =
      (focusedFeatureIndex.value - 1 + filteredFeatures.value.length) %
      filteredFeatures.value.length;
    scrollToFocusedItem();
  };

  const selectFocusedFeature = () => {
    if (
      focusedFeatureIndex.value >= 0 &&
      focusedFeatureIndex.value < filteredFeatures.value.length
    ) {
      handleFeatureClick(filteredFeatures.value[focusedFeatureIndex.value]);
    }
  };

  const hideDropdown = () => {
    showFeatureDropdown.value = false;
  };

  const scrollToFocusedItem = () => {
    const focusedItem = document.getElementById(
      `feature-item-${focusedFeatureIndex.value}`
    );
    if (focusedItem) {
      focusedItem.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  };

  // Add this with your other refs in the script section
  const showPopup = ref(false);
</script>

<style scoped>
.input-base {
  @apply mt-2 pl-2 py-1 border border-gray-300 rounded bg-gray-50 w-full outline-none transition-all duration-200;

  &:hover {
    @apply border-gray-400;
  }

  &:focus {
    @apply bg-white border-blue-500 ring-2 ring-blue-200;
  }
}

.input-error {
  @apply border-red-500 bg-red-50;
}

select.input-base {
  @apply appearance-none bg-no-repeat bg-right pr-8;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-size: 1.5em;
}

/* Add this to your CSS */
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-content {
  position: relative;
  background-color: #fff;
  padding: 20px;
  max-width: 900px; /* Increased from 600px */
  width: 95%; /* Increased from 90% */
  border-radius: 5px;
  margin: 20px; /* Added to ensure some spacing on very small screens */
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 50%;
}

.popup-content img {
  width: 100%;
  height: auto;
  object-fit: contain; /* This ensures the image maintains its aspect ratio */
}
</style>
