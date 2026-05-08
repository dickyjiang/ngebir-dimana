<script setup lang="ts">
  import { ref } from 'vue';
  import { useSupabaseClient } from '#imports';
  import type { Tables, TablesInsert } from '~/types/database.types';

  const supabase = useSupabaseClient();
  const router = useRouter();
  const loading = ref(false);
  const errorMsg = ref('');
  const successMsg = ref('');

  // Initialize with minimal required fields
  const cafeData = ref<Partial<TablesInsert<'cafes'>>>({
    name: '',
    full_address: '',
    city: '',
    state: '',
    postal_code: '',
    lat: null,
    long: null,
    description: '',
    phone: '',
    site: '',
  });

  const validateForm = () => {
    if (!cafeData.value.name) {
      errorMsg.value = 'Bar name is required';
      return false;
    }
    if (!cafeData.value.full_address) {
      errorMsg.value = 'Address is required';
      return false;
    }
    return true;
  };

  // Generate a slug from the cafe name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const submitCafe = async () => {
    if (!validateForm()) return;

    loading.value = true;
    errorMsg.value = '';

    try {
      // Generate a slug name if not provided
      if (!cafeData.value.slug_name && cafeData.value.name) {
        cafeData.value.slug_name = generateSlug(cafeData.value.name);
      }

      // Generate city_slug if not provided
      if (!cafeData.value.city_slug && cafeData.value.city) {
        cafeData.value.city_slug = generateSlug(cafeData.value.city);
      }

      const { data, error } = await supabase
        .from('cafes')
        .insert(cafeData.value)
        .select();

      if (error) throw error;

      successMsg.value = 'Bar created successfully!';

      // Navigate to the new cafe page
      if (data && data[0]) {
        setTimeout(() => {
          router.push(`/cafe/${data[0].id}`);
        }, 1500);
      }
    } catch (error: any) {
      errorMsg.value = error.message || 'Failed to create bar';
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Add New Bar</h1>

    <div
      v-if="successMsg"
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
    >
      {{ successMsg }}
    </div>

    <div
      v-if="errorMsg"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {{ errorMsg }}
    </div>

    <form @submit.prevent="submitCafe" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Bar Name *</label
            >
            <input
              v-model="cafeData.name"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Description</label
            >
            <textarea
              v-model="cafeData.description"
              rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Category</label
            >
            <input
              v-model="cafeData.category"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g. Coffee Shop, Bakery, etc."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              v-model="cafeData.phone"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Website</label
            >
            <input
              v-model="cafeData.site"
              type="url"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <!-- Location Information -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Full Address *</label
            >
            <input
              v-model="cafeData.full_address"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Street</label
            >
            <input
              v-model="cafeData.street"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >City</label
              >
              <input
                v-model="cafeData.city"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >State</label
              >
              <input
                v-model="cafeData.state"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Postal Code</label
            >
            <input
              v-model="cafeData.postal_code"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Latitude</label
              >
              <input
                v-model="cafeData.lat"
                type="number"
                step="any"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Longitude</label
              >
              <input
                v-model="cafeData.long"
                type="number"
                step="any"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          class="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          @click="router.back()"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          :disabled="loading"
        >
          {{ loading ? 'Saving...' : 'Save Bar' }}
        </button>
      </div>
    </form>
  </div>
</template>
