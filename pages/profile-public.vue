<template>
  <div class="bg-gray-100 min-h-screen py-8 px-[5%]">
    <div
      class="w-full sm:max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-12 rounded-2xl bg-white border"
      v-if="user"
    >
      <div class="grid grid-cols-1 md:grid-cols-2">
        <div
          class="pb-8 sm:pb-0 sm:border-r border-gray-300 pr-0 sm:pr-8 mb-10 sm:mb-0 border-b-2 sm:border-b-0"
        >
          <div class="pb-8 border-b border-gray-600 mb-8">
            <div>
              <div class="pb-1 border-b border-gray-600 mb-3">
                <h1 class="text-2xl text-gray-800">Owner / Admin</h1>
              </div>
              <div class="flex flex-col sm:flex-row gap-4 mb-8">
                <div class="flex gap-4 items-start justify-center w-full">
                  <div class="mt-4 relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
                    <img
                      :src="avatarUrl"
                      alt="Profile Picture"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex flex-col gap-4 flex-1 pt-2 bg-green-100">
                    <div class="flex flex-col gap-2">
                      <h1 class="text-2xl text-gray-800">
                        {{ userData.name }}
                      </h1>
                      <p>
                        {{ userData.phone_number }}
                      </p>
                      <div class="border w-full h-full">
                        <p>
                          jang bio
                          {{ userData.bio }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
               <div class="flex gap-2">
                      <button class="border w-full border-gray-600 text-gray-600 py-2 px-4 rounded-md text-sm text-center font-medium hover:bg-gray-800 hover:text-yellow-500 transition-colors disabled:cursor-not-allowed">
                       <a href="mailto:{{ user.email }}"></a>
                        <p>
                        {{ user.email }}
                      </p>
                      </button>
                    <button class="border w-full border-gray-600 text-gray-600 py-2 px-4 rounded-md text-sm text-center font-medium hover:bg-gray-800 hover:text-yellow-500 transition-colors disabled:cursor-not-allowed">
                      phone number
                    </button>
                    <button class="border w-full border-gray-600 text-gray-600 py-2 px-4 rounded-md text-sm text-center font-medium hover:bg-gray-800 hover:text-yellow-500 transition-colors disabled:cursor-not-allowed">Whatsapp</button>
                    </div>
            </div>
          </div>
        </div>
        <div class="pl-0 sm:pl-8">
          <div class="pb-1 border-b border-gray-600 mb-4">
            <h1 class="text-2xl text-gray-800">Bisnis</h1>
          </div>
          <div class="flex flex-col gap-2">
            <div
              v-for="cafe in cafesList"
              :key="cafe.slug_name"
              class="w-full border border-gray-300 rounded-md p-4 mb-4"
            >
              <NuxtImg
                :src="`${cafe.photo}`"
                alt="cafe_pic"
                class="w-full h-64 object-cover"
              />
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
                  <div class="flex flex-col gap-2">
                    <div
                      class="px-3 py-1 rounded-full bg-yellow-400 text-gray-800 text-center text-sm font-medium"
                    >
                      {{ cafe.business_type }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-2 flex justify-between gap-4">
                <!-- @dicky ttg publish & unpublish -->
                <div
                  v-if="cafe.is_published"
                  class="text-green-700 border border-green-700 py-2 px-4 rounded-full text-sm text-center font-medium bg-green-100"
                >
                  Published
                </div>
                <!-- <div
                  class="text-green-700 border border-green-700 py-2 px-4 rounded-full text-sm text-center font-medium"
                  :class="cafe.is_published ? 'bg-green-100' : 'bg-red-100'"
                >
                  {{ cafe.is_published ? "Published" : "Not Published" }}
                </div> -->
                <div class="flex gap-2 ml-auto">
                  <NuxtLink
                    :to="`/cafe/${cafe.slug_name}`"
                    v-if="cafe.is_published"
                  >
                    <button
                      class="border w-full border-gray-600 text-gray-600 py-2 px-6 rounded-md text-sm text-center font-medium hover:bg-gray-800 hover:text-yellow-500 transition-colors disabled:cursor-not-allowed"
                    >
                      View
                    </button>
                  </NuxtLink>
                  <NuxtLink :to="`/cafe/owner/form/${cafe.slug_name}`">
                    <button
                      class="border w-full border-gray-600 text-gray-600 py-2 px-6 rounded-md text-sm text-center font-medium hover:bg-gray-800 hover:text-yellow-500 transition-colors disabled:cursor-not-allowed"
                    >
                      Edit
                    </button></NuxtLink
                  >
                </div>
              </div>
              <div
                v-if="!cafe.is_published"
                id="message"
                class="mt-2 p-2 text-center text-sm border border-green-400 text-green-700 bg-green-400/20 rounded-md"
              >
                <p>
                  Terimakasih telah mendaftarkan Bisnis anda, informasi lebih
                  lanjut akan dikirim ke email, setelah pendaftaran anda selesai
                  diproses.
                </p>
              </div>
            </div>
            <!-- @budi show message after registration -->
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="flex justify-center items-center min-h-[60vh]"
    >
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
const userData = ref({
  name: '',
  avatarUrl: null,
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
  try {
    uploading.value = true

    if (!event.target.files || event.target.files.length === 0) {
      return
    }

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.value.id}.${fileExt}`

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // Update avatar URL
    avatarUrl.value = URL.createObjectURL(file)

    // Update user profile with avatar path
    await supabase.from('profiles').upsert({
      id: user.value.id,
      avatar_url: filePath,
      updated_at: new Date(),
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Error uploading avatar')
  } finally {
    uploading.value = false
  }
}

// Update profile information
const updateProfile = async () => {
  try {
    saving.value = true

    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.value.name,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update profile')
    }

    await response.json()
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
