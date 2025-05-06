<template>
    <div class="bg-gray-100 min-h-screen">
        <div class="max-w-6xl mx-auto px-[5%]">
          <section class=" pt-6 mb-8">
            <h1 class="text-2xl font-semibold mb-4">Cafe Owner Page</h1>
            <p class="text-gray-700 mb-4">
              Silahkan menambah atau mengedit informasi cafe Anda. Pastikan semua
              informasi yang Anda masukkan adalah benar dan sesuai dengan cafe Anda.
              Jika Anda memiliki pertanyaan atau masalah, silahkan hubungi
              <a href="mailto:admin@ngopi.di-mana.com"
                >admin</a>
            </p>
          </section>
          <section class="mb-8">
            <div class="bg-white shadow-md rounded px-4 pt-2 pb-8 mb-8">
              <div class="mt-10">
                <form>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-0">
                    <div class=" border-b sm:border-b-0 border-r-0 sm:border-r border-gray-300 px-4">
                        <div class="mb-8">
                      <label for="cafeName">Nama Cafe:</label>
                      <input
                        class="input-base"
                        :class="{ 'input-error': hasError('cafeName') }"
                        type="text"
                        id="cafeName"
                        name="cafeName"
                        required
                      />
                      <span v-if="hasError('cafeName')" class="text-red-500 text-sm">
                        {{ formErrors.cafeName.join(", ") }}
                      </span>
                      <p class="text-gray-500 text-sm mt-1">
                        <strong>Note:</strong> Ini adalah nama cafe Anda. Pastikan Nama
                        cafe yang akan ditampilkan di aplikasi. Pastikan nama ini sesuai
                        dengan nama cafe Anda.
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
                        required
                      />
                      <span v-if="hasError('street')" class="text-red-500 text-sm">
                        {{ formErrors.street.join(", ") }}
                      </span>
                    </div>
                    <!-- @budi jigana alamat lengkap iyeu teu kudu ditulis ku user nya - bakal badUX euy-solana hese -->
                    <!-- <div class="mb-8">
                      <label for="full_address">Alamat Lengkap:</label>
                      <textarea
                        class="input-base"
                        :class="{ 'input-error': hasError('full_address') }"
                        id="full_address"
                        name="full_address"
                        required
                      ></textarea>
                      <span
                        v-if="hasError('full_address')"
                        class="text-red-500 text-sm"
                      >
                        {{ formErrors.full_address.join(", ") }}
                      </span>
                      <p class="text-gray-500 text-sm mt-1">
                        <strong>Note:</strong> Ini adalah alamat lengkap cafe Anda.
                        contoh alamat lengkap : Jl. Gajah Mada No.1, Dauh Puri Kangin, Kec. Denpasar Utara, Kota Denpasar, Bali 80231.
                      </p>
                    </div> -->
                    <div class="mb-8">
                      <label for="description">Deskripsi:</label>
                      <textarea
                        class="input-base"
                        :class="{ 'input-error': hasError('description') }"
                        id="description"
                        name="description"
                        required
                      ></textarea>
                      <span v-if="hasError('description')" class="text-red-500 text-sm">
                        {{ formErrors.description.join(", ") }}
                      </span>
                      <p class="text-gray-500 text-sm mt-1">
                        <strong>Note:</strong> Ini adalah deskripsi cafe Anda. Pastikan
                        deskripsi yang akan ditampilkan di aplikasi. Pastikan deskripsi
                        ini sesuai dengan deskripsi cafe Anda.
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
                      />
                      <span v-if="hasError('site')" class="text-red-500 text-sm">
                        {{ formErrors.site.join(", ") }}
                      </span>
                      <p class="text-gray-500 text-sm mt-1">
                        <strong>Note:</strong> Untuk menghindari kesalahan, pastikan
                        untuk menyalin tautan (copy & paste) dari aplikasi Instagram atau website Anda.
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
                        {{ formErrors.phone.join(", ") }}
                      </span>
                    </div>
                    <div class="mb-8">
                      <label for="borough">Area:</label>
                      <input
                        class="input-base"
                        :class="{ 'input-error': hasError('borough') }"
                        type="text"
                        id="borough"
                        name="borough"
                        required
                      />
                      <span v-if="hasError('borough')" class="text-red-500 text-sm">
                        {{ formErrors.borough.join(", ") }}
                      </span>
                      <p class="text-gray-500 text-sm mt-1">
                        <strong>Note:</strong> Area bisa kecamatan atau kabupaten. Contoh: Jakarta Selatan, Dago, Lembang, dll.
                      </p>
                    </div>
                    <div class="mb-8">
                      <label for="state">Provinsi:</label>
                      <select
                        class="input-base"
                        :class="{ 'input-error': hasError('state') }"
                        id="state"
                        name="state"
                        v-model="selectedProvince"
                        required
                      >
                        <option value="" disabled>Pilih Provinsi</option>
                        <option v-for="province in provinces" :key="province" :value="province">
                          {{ province }}
                        </option>
                      </select>
                      <span v-if="hasError('state')" class="text-red-500 text-sm">
                        {{ formErrors.state.join(", ") }}
                      </span>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <div class="mb-8 w-3/4">
                          <label for="city">Kota:</label>
                          <select
                            class="input-base"
                            :class="{ 'input-error': hasError('city') }"
                            id="city"
                            name="city"
                            v-model="selectedCity"
                            required
                            :disabled="!selectedProvince"
                          >
                            <option value="" disabled>Pilih Kota</option>
                            <option v-for="city in availableCities" :key="city" :value="city">
                              {{ city }}
                            </option>
                          </select>
                          <span v-if="hasError('city')" class="text-red-500 text-sm">
                            {{ formErrors.city.join(", ") }}
                          </span>
                        </div>
                        <div class="mb-8">
                          <label for="postal_code">Kode Pos:</label>
                          <input
                            class="input-base"
                            :class="{ 'input-error': hasError('postal_code') }"
                            type="text"
                            id="postal_code"
                            name="postal_code"
                            required
                          />
                          <span v-if="hasError('postal_code')" class="text-red-500 text-sm">
                            {{ formErrors.postal_code.join(", ") }}
                          </span>
                        </div>
                        
                    </div>
                    <div class="flex gap-4">
                        <div class="mb-8">
                          <label for="lat">Latitude:</label>
                          <input
                            class="input-base"
                            :class="{ 'input-error': hasError('lat') }"
                            type="number"
                            step="any"
                            id="lat"
                            name="lat"
                            required
                          />
                          <span v-if="hasError('lat')" class="text-red-500 text-sm">
                            {{ formErrors.lat.join(", ") }}
                          </span>
                        </div>
                        <div class="mb-8">
                          <label for="long">Longitude:</label>
                          <input
                            class="input-base"
                            :class="{ 'input-error': hasError('long') }"
                            type="number"
                            step="any"
                            id="long"
                            name="long"
                            required
                          />
                          <span v-if="hasError('long')" class="text-red-500 text-sm">
                            {{ formErrors.long.join(", ") }}
                          </span>
                        </div>
                    </div>
                    <div class="mb-8">
                      <label for="time_zone">Time Zone:</label>
                      <input
                        class="input-base"
                        :class="{ 'input-error': hasError('time_zone') }"
                        type="text"
                        id="time_zone"
                        name="time_zone"
                        required
                      />
                      <span v-if="hasError('time_zone')" class="text-red-500 text-sm">
                        {{ formErrors.time_zone.join(", ") }}
                      </span>
                    </div>
                    <div class="mb-8">
                      <label for="rating">Rating:</label>
                      <input
                        class="input-base"
                        :class="{ 'input-error': hasError('rating') }"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        id="rating"
                        name="rating"
                        required
                      />
                      <span v-if="hasError('rating')" class="text-red-500 text-sm">
                        {{ formErrors.rating.join(", ") }}
                      </span>
                    </div>
                    <div class="mb-8">
                      <label for="">location_link:</label>
                      <input
                        class="input-base"
                      />
                    </div>
                    </div>
                    <div class="px-4 ">
                        <div class="flex flex-col space-y-2 mb-8">
                            <label for="logo">Logo Cafe:</label>
                            <input
                            type="file"
                            :class="{ 'input-error': hasError('logo') }"
                            id="logo"
                            name="logo"
                            accept="image/*"
                            multiple required/>
                            <span v-if="hasError('logo')" class="text-red-500 text-sm">
                            {{ formErrors.logo.join(", ") }}
                            </span>
                        </div>
                        <div class="flex flex-col space-y-2 mb-8">
                          <label for="cafeImage">Gambar Cafe:</label>
                          <input
                            type="file"
                            id="cafeImage"
                            name="cafeImage"
                            accept="image/*"
                            multiple
                            @change="handleImageUpload"
                          />
                          <div v-if="imagePreviews.length > 0" class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div v-for="(preview, index) in imagePreviews" :key="index" class="relative">
                              <img :src="preview" class="w-full h-32 object-cover rounded-lg"/>
                              <button 
                                @click="removeImage(index)" 
                                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                type="button">
                                ×
                              </button>
                            </div>
                          </div>
                          <p class="text-gray-500 text-sm mt-1">
                            <strong>Note:</strong> Upload beberapa foto yang menarik. Format yang
                            didukung: JPG atau PNG. Ukuran maksimal per file: 5MB.
                          </p>
                        </div>


                        <div class="mb-8">
                          <label class="block mb-4">Working Hours:</label>
                          <div class="flex flex-col space-y-4">
                            <div v-for="day in days" :key="day.id" class="border-b pb-4 last:border-b-0">
                              <div class="flex items-center justify-between">
                                <span class="font-medium">{{ day.name }}</span>
                                <div class="flex items-center space-x-4">
                                  <label class="relative inline-flex items-center cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      v-model="day.isOpen" 
                                      class="sr-only peer"
                                    >
                                    <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                  </label>
                                  <span class="text-gray-600">{{ day.isOpen ? 'Open' : 'Closed' }}</span>
                                </div>
                              </div>
    
                              <div v-if="day.isOpen" class="flex items-center space-x-6 pl-4 mt-4">
                                <div class="flex items-center space-x-2">
                                  <span class="text-sm text-gray-600">Opens at</span>
                                  <select 
                                    v-model="day.openTime"
                                    class="input-base py-1 px-2"
                                  >
                                    <option v-for="time in timeOptions" 
                                            :key="time.value" 
                                            :value="time.value">
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
                                    <option v-for="time in timeOptions" 
                                            :key="time.value" 
                                            :value="time.value">
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
                  <div class="flex justify-center  sm:justify-end px-8 mt-8">
                      <button
                        class="text-black font-semibold border border-black px-4 py-2 rounded-full "
                        type="submit">
                        Update Cafe Information
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
import { ref, watch } from "vue";

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
  time_zone: string[];
  rating: string[];
  logo: string[];
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
  time_zone: [],
  rating: [],
  logo: [],
});

// Add these after other ref imports
const imagePreviews = ref<string[]>([]);
const uploadedImages = ref<File[]>([]);

// Add these methods before the component ends
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      uploadedImages.value.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviews.value.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  });
};

const removeImage = (index: number) => {
  imagePreviews.value.splice(index, 1);
  uploadedImages.value.splice(index, 1);
};


const hasError = (field: keyof FormErrors): boolean => {
  return formErrors.value[field].length > 0;
};

const phoneNumber = ref("+62 "); // Initialize with space

const formatPhoneNumber = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Handle backspace by checking if the value is just "+62 "
  if (value === "+62 " || value === "+62") {
    phoneNumber.value = "+62 ";
    return;
  }

  // Remove non-digits except the plus sign and space
  value = value.replace(/[^\d+\s]/g, "");
  
  // If empty or just a plus, reset to "+62 "
  if (!value || value === "+") {
    phoneNumber.value = "+62 ";
    return;
  }
  
  // Ensure the number starts with "+62 "
  if (!value.startsWith("+62 ")) {
    // If user is typing without +62, add it
    value = value.replace(/^\+?62\s?|^0+/, ""); // Remove existing +62 or leading zeros
    phoneNumber.value = "+62 " + value;
  } else {
    phoneNumber.value = value;
  }
};

const provinces = ref([
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Kepulauan Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Banten',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Gorontalo',
  'Sulawesi Tengah',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat'
]);

const citiesByProvince = ref({
  'Aceh': ['Banda Aceh', 'Langsa', 'Lhokseumawe', 'Sabang', 'Subulussalam'],
  'Sumatera Utara': ['Medan', 'Binjai', 'Padang Sidempuan', 'Pematangsiantar', 'Sibolga', 'Tanjungbalai', 'Tebing Tinggi'],
  'Sumatera Barat': ['Padang', 'Bukittinggi', 'Payakumbuh', 'Sawahlunto', 'Solok', 'Pariaman'],
  'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur'],
  'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Cimahi', 'Cirebon', 'Depok', 'Sukabumi', 'Tasikmalaya'],
  'Jawa Tengah': ['Semarang', 'Surakarta', 'Magelang', 'Pekalongan', 'Salatiga', 'Tegal'],
  'DI Yogyakarta': ['Yogyakarta', 'Bantul', 'Sleman', 'Kulon Progo', 'Gunung Kidul'],
  'Jawa Timur': ['Surabaya', 'Malang', 'Madiun', 'Kediri', 'Mojokerto', 'Pasuruan', 'Probolinggo', 'Blitar'],
  'Bali': ['Denpasar', 'Badung', 'Gianyar', 'Bangli', 'Klungkung', 'Karangasem', 'Buleleng', 'Tabanan', 'Jembrana'],
  // Add other provinces and their cities...
});

const selectedProvince = ref('');
const selectedCity = ref('');
const availableCities = ref<string[]>([]);

const updateAvailableCities = () => {
  selectedCity.value = ''; // Reset selected city
  if (selectedProvince.value) {
    availableCities.value = citiesByProvince.value[selectedProvince.value] || [];
  } else {
    availableCities.value = [];
  }
};

watch(selectedProvince, updateAvailableCities);

interface DaySchedule {
  id: string;
  name: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const days = ref([
  { id: 'sunday', name: 'Sunday', isOpen: false, openTime: '', closeTime: '' },
  { id: 'monday', name: 'Monday', isOpen: false, openTime: '', closeTime: '' },
  { id: 'tuesday', name: 'Tuesday', isOpen: false, openTime: '', closeTime: '' },
  { id: 'wednesday', name: 'Wednesday', isOpen: false, openTime: '', closeTime: '' },
  { id: 'thursday', name: 'Thursday', isOpen: false, openTime: '', closeTime: '' },
  { id: 'friday', name: 'Friday', isOpen: false, openTime: '', closeTime: '' },
  { id: 'saturday', name: 'Saturday', isOpen: false, openTime: '', closeTime: '' }
]);

const generateTimeOptions = () => {
  const options = [{ value: "24", label: "24 hours" }];
  
  for (let hour = 0; hour < 24; hour++) {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour < 12 ? "AM" : "PM";
    
    // Full hour
    options.push({
      value: `${hour.toString().padStart(2, "0")}:00`,
      label: `${hour12}:00 ${period}`
    });
    
    // Half hour
    options.push({
      value: `${hour.toString().padStart(2, "0")}:30`,
      label: `${hour12}:30 ${period}`
    });
  }
  
  return options;
};

const timeOptions = ref(generateTimeOptions());
</script>

<style scoped>
.input-base {
  @apply mt-2 pl-2 py-1 border rounded-sm bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200;
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

select.input-base {
  @apply appearance-none bg-no-repeat bg-right pr-8;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-size: 1.5em;
}
</style>
