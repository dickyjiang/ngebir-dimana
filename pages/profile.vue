<template>
  <div class="bg-gray-100 min-h-screen py-8 px-[5%]">
    <div
      class="w-full sm:max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-12 rounded-2xl bg-white border"
      v-if="user">
      <div class="grid grid-cols-1 md:grid-cols-2">
        <div
          class="pb-8 sm:pb-0 sm:border-r border-gray-300 pr-0 sm:pr-8 mb-10 sm:mb-0 border-b-2 sm:border-b-0">
          <div class="pb-8 border-b border-gray-600 mb-8">
            <div>
              <div class="pb-1 border-b border-gray-600 mb-3">
                <h1 class="text-2xl text-gray-800">Profil Kamu</h1>
              </div>
              <div class="flex flex-col sm:flex-row gap-4 mb-8">
                <div class="flex">
                  <div
                    class="mt-4 relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
                    <img
                      v-if="avatarUrl"
                      :src="avatarUrl"
                      alt="Profile Picture"
                      class="w-full h-full object-cover" />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-5xl text-gray-600 bg-gray-100">
                      {{ user.email ? user.email.charAt(0).toUpperCase() : '?' }}
                    </div>
                    <div
                      class="absolute bottom-0 left-0 right-0 bg-black/60 text-white py-2 text-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                      @click="selectFile">
                      <span>Change</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    class="hidden"
                    @change="uploadAvatar" />
                  <p v-if="uploading" class="text-sm text-gray-600 mt-2">Uploading...</p>
                </div>
                <div class="flex flex-col gap-4 flex-1">
                  <div class="flex flex-col gap-2">
                    <label for="name" class="font-medium text-gray-600">Nama Lengkap</label>
                    <input
                      type="text"
                      id="name"
                      v-model="userData.name"
                      placeholder="Nama Lengkap"
                      class="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-500" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="email" class="font-medium text-gray-600">Email</label>
                    <input
                      type="email"
                      id="email"
                      :value="user.email"
                      disabled
                      class="p-3 border border-gray-300 rounded-md text-base bg-gray-100 cursor-not-allowed" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="phone" class="font-medium text-gray-600">
                      Phone (WhatApps Enabled)</label
                    >
                    <input
                      type="text"
                      id="phone"
                      v-model="userData.phone_number"
                      placeholder="No. Telepon"
                      class="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-500" />
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <label for="bio" class="font-medium text-gray-600">Bio anda</label>
              <textarea
                id="bio"
                v-model="userData.bio_profile"
                placeholder="Sedikit mengenai anda"
                rows="4"
                class="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-500"></textarea>
            </div>
            <button
              class="mt-4 bg-gray-800 text-white py-3 px-4 rounded-md text-base font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              @click="updateProfile"
              :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
          <div class="">
            <div>
              <h2 class="mb-3 text-2xl text-gray-800">Tambah Bisnis</h2>
              <p class="font-medium text-gray-600">Pilih Jenis usaha yang mau ditambahkan.</p>
              <p class="text-gray-500">Kamu boleh menambah lebih dari satu jenis usaha.</p>
            </div>
            <div class="grid grid-cols-2 gap-4 pt-8">
              <div
                class="flex flex-col items-center justify-end gap-8 bg-gray-100 px-4 py-3 rounded-md border border-gray-600">
                <img class="w-20" src="/src/assets/img/newCafe.svg" alt="" />
                <NuxtLink
                  to="/cafe/owner/form?business_type=Cafe"
                  class="border w-full border-gray-600 text-gray-600 py-2 px-3 rounded-md text-sm text-center font-medium hover:bg-gray-800 hover:text-yellow-500 transition-colors">
                  Cafe</NuxtLink
                >
              </div>
              <!-- @budi create page form buat roastery -->
              <div
                class="flex flex-col items-center justify-between gap-4 bg-gray-100 px-4 py-3 rounded-md border border-gray-600">
                <img class="w-20 opacity-70" src="/src/assets/img/coffee-beans.svg" alt="" />
                <p class="text-red-500">Coming Soon</p>
                <NuxtLink
                  to="/cafe/owner/form?business_type=roastery"
                  class="border w-full border-gray-600 text-gray-600 py-2 px-3 rounded-md text-sm text-center font-medium">
                  Beans & Roastery
                </NuxtLink>
              </div>
              <!-- @budi create page form buat add supplies -->
              <div
                class="flex flex-col items-center justify-center gap-4 bg-gray-100 px-4 py-3 rounded-md border border-gray-600">
                <img class="w-20 opacity-70" src="/src/assets/img/portafilter.svg" alt="" />
                <p class="text-red-500">Coming Soon</p>
                <NuxtLink
                  to="/cafe/owner/form?business_type=Supplier"
                  class="border w-full border-gray-600 text-gray-600 py-2 px-3 rounded-md text-sm text-center font-medium">
                  Tools & Supplies
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <div class="pl-0 sm:pl-8">
          <div class="pb-1 border-b border-gray-600 mb-4">
            <h1 class="text-2xl text-gray-800">Bisnis kamu</h1>
          </div>
          <div class="flex flex-col gap-2">
            <div
              v-for="cafe in cafesList"
              :key="cafe.slug_name"
              class="w-full border border-gray-300 rounded-md p-4 mb-4">
              <NuxtImg :src="`${cafe.photo}`" alt="cafe_pic" class="w-full h-64 object-cover" />
              <div class="mt-3 flex flex-col gap-3">
                <div class="w-full flex gap-2 justify-between items-start">
                  <div>
                    <h2 class="text-xl font-semibold flex-1">
                      {{ cafe.name }}
                    </h2>
                    <p class="text-gray-500">
                      {{ cafe.street }}
                    </p>
                    <p>{{ cafe.city.city_name }}</p>
                  </div>
                  <!-- Replace the single business_type display with this -->
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="type in cafe.business_type"
                      :key="type"
                      class="px-3 py-1 rounded-full bg-yellow-400 text-gray-800 text-center text-sm font-medium">
                      @dicky aneh kok nyatu
                      {{ type }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-2 flex justify-between gap-4">
                <!-- @dicky ttg publish & unpublish -->
                <div
                  v-if="cafe.is_published"
                  class="text-green-700 border border-green-700 py-2 px-4 rounded-full text-sm text-center font-medium bg-green-100">
                  Published
                </div>
                <!-- <div
                  class="text-green-700 border border-green-700 py-2 px-4 rounded-full text-sm text-center font-medium"
                  :class="cafe.is_published ? 'bg-green-100' : 'bg-red-100'"
                >
                  {{ cafe.is_published ? "Published" : "Not Published" }}
                </div> -->
                <div class="flex gap-2 ml-auto">
                  <NuxtLink :to="`/cafe/${cafe.slug_name}`" v-if="cafe.is_published">
                    <button
                      class="border w-full border-gray-600 text-gray-600 py-2 px-6 rounded-md text-sm text-center font-medium hover:bg-gray-800 hover:text-yellow-500 transition-colors disabled:cursor-not-allowed">
                      View
                    </button>
                  </NuxtLink>
                  <NuxtLink :to="`/cafe/owner/form/${cafe.slug_name}`">
                    <button
                      class="border w-full border-gray-600 text-gray-600 py-2 px-6 rounded-md text-sm text-center font-medium hover:bg-gray-800 hover:text-yellow-500 transition-colors disabled:cursor-not-allowed">
                      Edit
                    </button></NuxtLink
                  >
                </div>
              </div>
              <div
                v-if="!cafe.is_published"
                id="message"
                class="mt-2 p-2 text-center text-sm border border-green-400 text-green-700 bg-green-400/20 rounded-md">
                <p>
                  Terimakasih telah mendaftarkan Bisnis anda, informasi lebih lanjut akan dikirim ke
                  email, setelah pendaftaran anda selesai diproses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center items-center min-h-[60vh]">
      <p>Loading profile...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { NuxtImg } from '#components'

definePageMeta({
  layout: 'member',
})
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const fileInput = ref(null)
const uploading = ref(false)
const saving = ref(false)
const avatarUrl = ref(null)
const cafesList = ref([])
const logoFile = ref([]) // Store the actual File objects

// const logoFile = ref<File>([]); // Store the actual File objects
const userData = ref({
  name: '',
  avatarUrl: null,
  phone_number: '',
  bio_profile: '',
})

// Fetch user profile on mount
onMounted(async () => {
  if (user.value) {
    await fetchProfile()
    //   await fetchAvatar();
  } else {
    router.push('/')
  }
})

// Fetch user profile data
const fetchProfile = async () => {
  try {
    const response = await fetch('/api/profile')

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    const { data, cafeData } = await response.json()
    // const data = await response.json();

    if (data) {
      userData.value.name = data.full_name || ''
      userData.value.avatarUrl = data.avatar_url || null
      avatarUrl.value = data.avatar_url || null
      userData.value.phone_number = data.phone_number || ''
      userData.value.bio_profile = data.bio_profile || ''
    }
    if (cafeData) {
      cafesList.value = cafeData
    } else {
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

// Open file dialog
const selectFile = () => {
  fileInput.value.click()
}

// Upload avatar
const uploadAvatar = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file
  if (!file.type.match('image.*')) {
    formErrors.value.logo = ['Please upload an image file']
    return
  }

  if (file.size > 1 * 1024 * 1024) {
    // 5MB
    formErrors.value.logo = ['Image size must be less than 1MB']
    return
  }

  // Update the logo file and create preview
  logoFile.value = [file]

  const preview = URL.createObjectURL(file)
  console.log('preview', preview)
  avatarUrl.value = preview
  // logoPreview.value = [preview];
  event.target.value = ''

  // logoPreview.value = URL.createObjectURL(file);

  // Clear any previous errors
  formErrors.value.logo = []
}

// Update profile information
const updateProfile = async () => {
  try {
    saving.value = true

    const formData = new FormData()
    if (logoFile.value.length > 0) {
      formData.append('avatar', logoFile.value[0])
    }
    formData.append('name', userData.value.name)
    formData.append('phone_number', userData.value.phone_number)
    formData.append('bio_profile', userData.value.bio_profile)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    }

    alert('Profile updated successfully!')
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Error updating profile')
  } finally {
    saving.value = false
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.logout-button {
  background-color: transparent;
  color: #ff5a5f;
  border: 1px solid #ff5a5f;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.logout-button:hover {
  background-color: #ff5a5f;
  color: white;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0e0e0;
  margin-bottom: 1rem;
  display: flex;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #555;
  background-color: #f5f5f5;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.hidden {
  display: none;
}

.uploading-text {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.save-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.save-button:hover {
  background-color: #3a80d2;
}

.save-button:disabled {
  background-color: #a0c0e8;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }

  .avatar-section {
    margin-bottom: 2rem;
  }
}
</style>
