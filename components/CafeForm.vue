<!-- components/CafeForm.vue -->
<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="max-w-6xl mx-auto px-[5%]">
      <section class="pt-6 mb-8">
        <h1 class="text-2xl font-semibold mb-4">{{ formTitle }}</h1>
        <p class="text-gray-700 mb-4">
          Silahkan menambah atau mengedit informasi cafe Anda. Pastikan semua
          informasi yang Anda masukkan adalah benar dan sesuai dengan cafe Anda.
          Jika Anda memiliki pertanyaan atau masalah, silahkan hubungi
          <a href="mailto:admin@ngopi.di-mana.com">admin</a>
        </p>
      </section>

      <!-- Your existing form content from add.vue -->
      <section class="mb-8">
        <div class="bg-white shadow-md rounded px-4 pt-2 pb-8 mb-8">
          <div class="mt-10">
            <form>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-0">
                <div
                  class="border-b sm:border-b-0 border-r-0 sm:border-r border-gray-300 px-4"
                >
                  <div class="mb-8">
                    <label class="block mb-2"
                      >Jenis usaha:
                      <span class="text-sm text-gray-400"
                        >(Pilih semua yang sesuai)</span
                      ></label
                    >
                    <div class="space-y-2">
                      <label class="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          v-model="businessTypes"
                          value="cafe"
                          class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span>Cafe</span>
                      </label>
                      <label class="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          v-model="businessTypes"
                          value="roastery"
                          class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span>Roastery</span>
                      </label>
                      <label class="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          v-model="businessTypes"
                          value="supplier"
                          class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span>Supplier Alat-alat</span>
                      </label>
                    </div>
                    <!-- <span v-if="hasError('businessTypes')" class="text-red-500 text-sm">
                      {{ formErrors.businessTypes?.join(', ') }}
                    </span> -->
                  </div>
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
                      <strong>Note:</strong> Pastikan deskripsi ini sesuai
                      dengan deskripsi cafe Anda.
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
                      <span
                        v-if="hasError('state')"
                        class="text-red-500 text-sm"
                      >
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
                          <option value="" disabled>
                            Pilih Kota/Kabupaten
                          </option>
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
                  <div class="mb-8 p-4 border border-gray-300 rounded-md">
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
                    <p class="text-gray-500 text-sm mt-2 text-center">
                      Masukan tautan URL (URL link) dari Google Business anda
                      disini (diawalin dengan:
                      <span class="font-semibold text-gray-700"
                        >https://maps.app.goo.gl/</span
                      >) Click button di bawah untuk panduan cara menemukan
                      Google location_link anda
                    </p>
                    <div class="flex flex-col items-center justify-center">
                      <button
                        @click="showPopup = true"
                        type="button"
                        class="text-sm rounded-lg border bg-gray-100 border-gray-400 mt-3 text-gray-500 px-3 py-2 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cara mendapatkan Google location_link
                      </button>
                      <div
                        v-if="showPopup"
                        class="popup"
                        @click.self="showPopup = false"
                      >
                        <div class="popup-content">
                          <span class="close-btn" @click="showPopup = false"
                            >&times;</span
                          >
                          <img
                            src="/public/img/tutorial_location_link.png"
                            alt="Tutorial Location"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="px-4">
                  <div class="mb-8">
                    <label for="logo">Logo Cafe:</label>
                    <div
                      class="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg"
                    >
                      <label for="logo" class="w-full cursor-pointer">
                        <input
                          type="file"
                          id="logo"
                          name="logo"
                          accept="image/*"
                          required
                          @change="handleLogoUpload"
                          class="sr-only"
                        />
                        <div class="space-y-1 text-center">
                          <svg
                            class="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          <div
                            class="flex items-center flex-col text-sm text-gray-600"
                          >
                            <span
                              class="relative rounded font-medium text-gray-800 hover:text-gray-500"
                              >Upload a file</span
                            >
                          </div>
                          <p class="text-xs text-gray-500">
                            JPG, JPEG, PNG and WEBP up to 5MB
                          </p>
                        </div>
                      </label>
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
                    <label for="cafeImage">Main Photo Cafe:</label>
                    <div
                      class="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg"
                    >
                      <label for="cafeImage" class="w-full cursor-pointer">
                        <input
                          type="file"
                          id="cafeImage"
                          name="cafeImage"
                          accept="image/*"
                          @change="handleImageUpload"
                          class="sr-only"
                        />
                        <div class="space-y-1 text-center">
                          <svg
                            class="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          <div
                            class="flex flex-col items-center text-sm text-gray-600"
                          >
                            <span
                              class="relative rounded-md font-medium text-gray-800 hover:text-gray-500"
                              >Upload files</span
                            >
                          </div>
                          <p class="text-xs text-gray-500">
                            JPG, JPEG, PNG and WEBP up to 20MB
                          </p>
                        </div>
                      </label>
                    </div>

                    <!-- Display validation errors -->
                    <div
                      v-if="imageErrors.length > 0"
                      class="text-red-500 text-sm mt-2"
                    >
                      <p v-for="(error, index) in imageErrors" :key="index">
                        {{ error }}
                      </p>
                    </div>

                    <!-- Image preview section -->
                    <div
                      v-if="imagePreviews.length > 0"
                      class="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      <div
                        v-for="(preview, index) in imagePreviews"
                        :key="index"
                        class="relative"
                      >
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

                  <div class="flex flex-col space-y-2 mb-8">
                    <label for="menuImage">Photo Others:</label>
                    <div
                      class="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg"
                    >
                      <label for="menuImage" class="w-full cursor-pointer">
                        <input
                          type="file"
                          id="menuImage"
                          name="menuImage"
                          accept="image/*"
                          multiple
                          @change="handleMenuImageUpload"
                          class="sr-only"
                        />
                        <div class="space-y-1 text-center">
                          <svg
                            class="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          <div
                            class="flex flex-col items-center text-sm text-gray-600"
                          >
                            <span
                              class="relative rounded-md font-medium text-gray-800 hover:text-gray-500"
                              >Upload files</span
                            >
                          </div>
                          <p class="text-xs text-gray-500">
                            JPG, JPEG, PNG and WEBP up to 20MB
                          </p>
                        </div>
                      </label>
                    </div>

                    <!-- Display validation errors -->
                    <div
                      v-if="menuImageErrors.length > 0"
                      class="text-red-500 text-sm mt-2"
                    >
                      <p v-for="(error, index) in menuImageErrors" :key="index">
                        {{ error }}
                      </p>
                    </div>

                    <!-- Image preview section -->
                    <div
                      v-if="menuImagePreviews.length > 0"
                      class="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      <div
                        v-for="(preview, index) in menuImagePreviews"
                        :key="index"
                        class="relative"
                      >
                        <img
                          :src="preview"
                          class="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          @click="removeMenuImage(index)"
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
                      <div class="hs-dropdown relative w-full">
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
                      <strong>Note:</strong> Pilih semua fitur yang sesuai
                      dengan café anda.
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
              hasAnyErrors:{{ hasAnyErrors() }} isSubmitting:{{ isSubmitting }}

              <button
                class="text-black font-semibold border border-black px-4 py-2 rounded-full relative"
                type="submit"
                @click="submitForm"
                :disabled="isSubmitting || hasAnyErrors()"
                :class="{ 'opacity-50 cursor-not-allowed': hasAnyErrors() }"
              >
                <span :class="{ 'opacity-0': isSubmitting }">
                  {{ submitButtonText }}
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
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useCafeForm } from '~/composables/useCafeForm';
  import { formatPhoneNumber, generateTimeOptions } from '~/utils/formUtils';
  import {
    processImageUpload,
    createImagePreview,
    validateImageFile,
  } from '~/utils/imageUtils';
  import {
    isFeatureSelected as checkFeatureSelected,
    toggleFeatureSelection as toggleFeature,
    removeSelectedFeature as removeFeature,
  } from '~/utils/featureUtils';

  // Define props to control the form behavior
  const props = defineProps({
    isEditMode: {
      type: Boolean,
      default: false,
    },
    cafeId: {
      type: String,
      default: null,
    },
    formTitle: {
      type: String,
      default: 'Cafe Information',
    },
    submitButtonText: {
      type: String,
      default: 'Submit',
    },
  });

  const isSubmitting = ref(false);

  // const parentCities = ref<ParentCity[]>([]);
  // const selectedParentCity = ref('');
  // const selectedChildCity = ref('');
  // const availableChildCities = ref<ChildCity[]>([]);
  // const locationLink = ref('');
  const showPopup = ref(false);
  const logoPreview = ref<string | null>(null);
  // const logoFile = ref<File | null>(null);
  // const imageFiles = ref<File[]>([]); // Store the actual File objects
  // const imageErrors = ref<string[]>([]); // Store validation errors
  const imageUploadProgress = ref<number[]>([]); // Track upload progress
  const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
  const maxImageCount = 5; // Maximum number of images allowed
  const imagePreviews = ref<string[]>([]);

  // const menuImageFiles = ref<File[]>([]); // Store the actual File objects
  // const menuImageErrors = ref<string[]>([]); // Store validation errors
  const menuImagePreviews = ref<string[]>([]);
  const menuImageUploadProgress = ref<number[]>([]); // Track upload progress

  const isEditMode = ref(props.isEditMode);
  const cafeId = ref(props.cafeId);

  const showFeatureDropdown = ref(false);
  // const selectedFeatures = ref<Feature[]>([]);
  const dropdownRef = ref<HTMLElement | null>(null);
  const focusedFeatureIndex = ref(-1);
  const timeOptions = ref(generateTimeOptions());

  const selectedCity = ref('');

  const selectedProvince = ref('');

  const citiesByProvince = ref([]);
  const availableCities = ref<string[]>([]);

  const { features } = await useFetchFeatures();
  const allFeatures = ref<Feature[]>(features || []);

  const featureSearchQuery = ref('');

  const filteredFeatures = ref<Feature[]>([]);

  const hasError = (field: keyof FormErrors): boolean => {
    return formErrors.value[field].length > 0;
  };
  const hasAnyErrors = (): boolean => {
    // Check if any field has errors
    return Object.values(formErrors.value).some((errors) => errors.length > 0);
  };
  // Use the shared form logic
  const {
    cafeName,
    businessTypes,
    cafeStreet,
    cafeSite,
    cafeDescription,
    phoneNumber,
    isSubmitting: formSubmitting,
    validateForm,
    submitForm: handleSubmit,
    loadCafeData,
    parentCities,
    selectedChildCity,
    selectedParentCity,
    availableChildCities,
    locationLink,
    selectedFeatures,
    days,
    logoFile,
    imageFiles,
    menuImageFiles,
    formErrors,
    menuImageErrors,
    imageErrors,
  } = useCafeForm(isEditMode, cafeId);
  watch(
    () => props.isEditMode,
    (newVal) => {
      isEditMode.value = newVal;
    }
  );

  watch(
    () => props.cafeId,
    (newVal) => {
      cafeId.value = newVal;
    }
  );

  // Make sure to merge the isSubmitting refs
  watch(formSubmitting, (val) => {
    isSubmitting.value = val;
  });

  // Redefine submitForm to use the one from the composable
  const submitForm = () => {
    handleSubmit();
  };

  // Force reload data if needed
  onMounted(() => {
    if (props.isEditMode && props.cafeId) {
      loadCafeData();
    }
    searchFeatures();
  });

  const validateOnChangeForm = () => {
    // Clear previous errors for this field
    formErrors.value.cafeName = [];
    formErrors.value.state = [];
    formErrors.value.city = [];
    formErrors.value.location_link = [];
    imageErrors.value = [];
    menuImageErrors.value = [];

    // Validate the café name
    if (!cafeName.value || cafeName.value.trim() === '') {
      formErrors.value.cafeName.push('Nama cafe tidak boleh kosong');
    }
  };

  const handleLogoUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Clear previous errors
    formErrors.value.logo = [];

    const validation = validateImageFile(file, maxFileSize);
    if (!validation.valid) {
      formErrors.value.logo.push(validation.error as string);
      return;
    }

    logoFile.value = file;

    try {
      logoPreview.value = await createImagePreview(file);
    } catch (error) {
      formErrors.value.logo.push('Failed to create logo preview');
    }
  };

  const removeLogo = () => {
    logoPreview.value = null;
    logoFile.value = null;
    // Reset the file input
    const input = document.getElementById('logo') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleImageUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    // Clear previous errors
    imageErrors.value = [];

    // Check if adding these files would exceed the maximum
    const { validFiles, previews, errors, progress } = await processImageUpload(
      files,
      maxFileSize,
      maxImageCount,
      imageFiles.value.length
    );

    if (errors.length > 0) {
      imageErrors.value = errors;
    }

    imageFiles.value = [...imageFiles.value, ...validFiles];
    imagePreviews.value = [...imagePreviews.value, ...previews];
    imageUploadProgress.value = [...imageUploadProgress.value, ...progress];

    input.value = '';
  };

  const removeImage = (index: number) => {
    imagePreviews.value.splice(index, 1);
    imageFiles.value.splice(index, 1);
    imageUploadProgress.value.splice(index, 1);
  };

  const handleMenuImageUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    // Clear previous errors
    menuImageErrors.value = [];

    const { validFiles, previews, errors, progress } = await processImageUpload(
      files,
      maxFileSize,
      maxImageCount,
      menuImageFiles.value.length
    );

    if (errors.length > 0) {
      menuImageErrors.value = errors;
    }

    menuImageFiles.value = [...menuImageFiles.value, ...validFiles];
    menuImagePreviews.value = [...menuImagePreviews.value, ...previews];
    menuImageUploadProgress.value = [
      ...menuImageUploadProgress.value,
      ...progress,
    ];

    input.value = '';
  };

  const removeMenuImage = (index: number) => {
    menuImagePreviews.value.splice(index, 1);
    menuImageFiles.value.splice(index, 1);
    menuImageUploadProgress.value.splice(index, 1);
  };

  const removeSelectedFeature = (feature: Feature) => {
    removeFeature(feature, selectedFeatures);
  };

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

  const isFeatureSelected = (feature: Feature): boolean => {
    return checkFeatureSelected(feature, selectedFeatures.value);
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
  const handleFeatureClick = (feature: Feature) => {
    toggleFeatureSelection(feature);
    // Clear the search input after selection
    featureSearchQuery.value = '';
    // Keep focus on the input to prevent dropdown from closing
    document.getElementById('features-search')?.focus();
    // Refresh the available features to show all options again
    filteredFeatures.value = allFeatures.value;
  };

  const updateAvailableCities = () => {
    selectedCity.value = ''; // Reset selected city
    if (selectedProvince.value) {
      availableCities.value =
        citiesByProvince.value[selectedProvince.value] || [];
    } else {
      availableCities.value = [];
    }
  };
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

  watch(selectedProvince, updateAvailableCities);
  watch(selectedParentCity, updateAvailableChildCities);
</script>

<style scoped>
  /* Your existing styles from add.vue */
</style>
