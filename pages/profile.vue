<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-6xl mx-auto py-8 px-12 rounded-2xl bg-white" v-if="user">
      <div class="grid grid-cols-1 md:grid-cols-2">
        <div class="border-r border-gray-300 pr-8">
          <div>
            <h1 class="text-2xl text-gray-800">Profile</h1>
            <div
              class="mt-4 relative w-[120px] h-[120px] rounded-full overflow-hidden bg-gray-200 mb-4"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt=""
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-5xl text-gray-600 bg-gray-100"
              >
                {{ user.email ? user.email.charAt(0).toUpperCase() : '?' }}
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 bg-black/60 text-white py-2 text-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                @click="selectFile"
              >
                <span>Change</span>
              </div>
            </div>
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              class="hidden"
              @change="uploadAvatar"
            />
            <p v-if="uploading" class="text-sm text-gray-600 mt-2">
              Uploading...
            </p>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label for="name" class="font-medium text-gray-600"
                >Full Name</label
              >
              <input
                type="text"
                id="name"
                v-model="userData.name"
                placeholder="Your name"
                class="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label for="email" class="font-medium text-gray-600">Email</label>
              <input
                type="email"
                id="email"
                :value="user.email"
                disabled
                class="p-3 border border-gray-300 rounded-md text-base bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label for="bio" class="font-medium text-gray-600">Bio</label>
              <textarea
                id="bio"
                v-model="userData.bio"
                placeholder="Tell us about yourself"
                rows="4"
                class="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              class="mt-4 bg-blue-500 text-white py-3 px-4 rounded-md text-base font-medium hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              @click="updateProfile"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
        <div class="pl-8">
          <h1 class="text-xl text-gray-800 mb-4">List Usaha kamu</h1>
          <div class="w-full border border-gray-300 rounded-md p-4 mb-4">
            <img
              src="/img/noimg.webp"
              alt="cafe_pic"
              class="w-full h-64 object-cover"
            />
            <div class="mt-4 flex flex-col gap-2">
              <div class="w-full flex justify-between items-center">
                <h2 class="text-xl font-semibold">Cafe name</h2>
                <p>Cafe</p>
              </div>
              <div class="flex justify-between items-center">
                <p>Data naon deui nya?</p>
              </div>
            </div>
            <div class="mt-2 flex justify-end w-full">
              <button
                class="bg-blue-500 text-white py-3 px-8 rounded-md text-base font-medium hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                edit
              </button>
            </div>
          </div>
          <div class="w-full border border-gray-300 rounded-md p-4 mb-4">
            <img
              src="/img/noimg.webp"
              alt="cafe_pic"
              class="w-full h-64 object-cover"
            />
            <div class="mt-4 flex flex-col gap-2">
              <div class="w-full flex justify-between items-center">
                <h2 class="text-xl font-semibold">Cafe name</h2>
                <p>Cafe</p>
              </div>
              <div class="flex justify-between items-center">
                <p>Data naon deui nya?</p>
              </div>
            </div>
            <div class="mt-2 flex justify-end w-full">
              <button
                class="bg-blue-500 text-white py-3 px-8 rounded-md text-base font-medium hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                edit
              </button>
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
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useSupabaseClient, useSupabaseUser } from '#imports';
  import { NuxtImg } from '#components';

  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const fileInput = ref(null);
  const uploading = ref(false);
  const saving = ref(false);
  const avatarUrl = ref(null);
  const userData = ref({
    name: '',
    avatarUrl: null,
  });

  // Fetch user profile on mount
  onMounted(async () => {
    if (user.value) {
      await fetchProfile();
      //   await fetchAvatar();
    }
  });

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const { data } = await response.json();

      if (data) {
        userData.value.name = data.full_name || '';
        userData.value.avatarUrl = data.avatar_url || null;
        avatarUrl.value = data.avatar_url || null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch avatar
  const fetchAvatar = async () => {
    try {
      const response = await fetch('/api/profile/avatar');

      if (!response.ok) {
        throw new Error('Failed to fetch avatar');
      }

      const { url } = await response.json();

      if (url) {
        avatarUrl.value = url;
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  };

  // Open file dialog
  const selectFile = () => {
    fileInput.value.click();
  };

  // Upload avatar
  const uploadAvatar = async (event) => {
    try {
      uploading.value = true;

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.value.id}.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update avatar URL
      avatarUrl.value = URL.createObjectURL(file);

      // Update user profile with avatar path
      await supabase.from('profiles').upsert({
        id: user.value.id,
        avatar_url: filePath,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar');
    } finally {
      uploading.value = false;
    }
  };

  // Update profile information
  const updateProfile = async () => {
    try {
      saving.value = true;

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.value.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      await response.json();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      saving.value = false;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
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
