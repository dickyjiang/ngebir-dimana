<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useSupabaseClient } from '#imports';
  import type { Tables, TablesInsert } from '~/types/database.types';

  const supabase = useSupabaseClient();
  const route = useRoute();
  const router = useRouter();

  const cafeId = ref<number | null>(null);
  const cafeName = ref('');
  const allFeatures = ref<Tables<'features'>[]>([]);
  const selectedFeatures = ref<number[]>([]);
  const loading = ref(false);
  const errorMsg = ref('');
  const successMsg = ref('');
  const newFeature = ref('');

  // If cafe ID is provided in the route, fetch cafe details
  onMounted(async () => {
    if (route.query.cafeId) {
      cafeId.value = parseInt(route.query.cafeId as string);
      await fetchCafeDetails();
    }

    await fetchAllFeatures();
  });

  const fetchCafeDetails = async () => {
    if (!cafeId.value) return;

    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('name')
        .eq('id', cafeId.value)
        .single();

      if (error) throw error;
      if (data) {
        cafeName.value = data.name || 'Unnamed Cafe';
      }
    } catch (error: any) {
      errorMsg.value = error.message || 'Failed to fetch cafe details';
    }
  };

  const fetchAllFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) {
        allFeatures.value = data;
      }

      // If we have a cafe ID, fetch its existing features
      if (cafeId.value) {
        await fetchCafeFeatures();
      }
    } catch (error: any) {
      errorMsg.value = error.message || 'Failed to fetch features';
    }
  };

  const fetchCafeFeatures = async () => {
    if (!cafeId.value) return;

    try {
      const { data, error } = await supabase
        .from('cafe_features')
        .select('feature_id')
        .eq('cafe_id', cafeId.value);

      if (error) throw error;
      if (data) {
        selectedFeatures.value = data.map((item) => item.feature_id);
      }
    } catch (error: any) {
      errorMsg.value = error.message || 'Failed to fetch cafe features';
    }
  };

  const toggleFeature = (featureId: number) => {
    const index = selectedFeatures.value.indexOf(featureId);
    if (index === -1) {
      selectedFeatures.value.push(featureId);
    } else {
      selectedFeatures.value.splice(index, 1);
    }
  };

  const addNewFeature = async () => {
    if (!newFeature.value.trim()) return;

    loading.value = true;

    try {
      // Generate a slug for the new feature
      const featureSlug = newFeature.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      const { data, error } = await supabase
        .from('features')
        .insert({
          name: newFeature.value.trim(),
          feature_slug: featureSlug,
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        allFeatures.value.push(data[0]);
        selectedFeatures.value.push(data[0].id);
        newFeature.value = '';
      }
    } catch (error: any) {
      errorMsg.value = error.message || 'Failed to add new feature';
    } finally {
      loading.value = false;
    }
  };

  const saveFeatures = async () => {
    if (!cafeId.value) {
      errorMsg.value = 'Cafe ID is required';
      return;
    }

    loading.value = true;
    errorMsg.value = '';

    try {
      // First delete all existing features for this cafe
      const { error: deleteError } = await supabase
        .from('cafe_features')
        .delete()
        .eq('cafe_id', cafeId.value);

      if (deleteError) throw deleteError;

      // Then insert the new selected features
      if (selectedFeatures.value.length > 0) {
        const featuresToInsert = selectedFeatures.value.map((featureId) => ({
          cafe_id: cafeId.value,
          feature_id: featureId,
        }));

        const { error: insertError } = await supabase
          .from('cafe_features')
          .insert(featuresToInsert);

        if (insertError) throw insertError;
      }

      successMsg.value = 'Cafe features saved successfully!';

      // Navigate back to cafe details after a short delay
      setTimeout(() => {
        router.push(`/cafe/${cafeId.value}`);
      }, 1500);
    } catch (error: any) {
      errorMsg.value = error.message || 'Failed to save features';
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <div v-if="cafeId" class="mb-6">
      <h1 class="text-2xl font-bold">Add Features for {{ cafeName }}</h1>
      <p class="text-gray-600">Select all features that apply to this cafe</p>
    </div>
    <div v-else class="mb-6">
      <h1 class="text-2xl font-bold">Add Cafe Features</h1>
      <p class="text-gray-600 text-red-500">
        No cafe selected. Please specify a cafe ID in the URL.
      </p>
    </div>

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

    <div v-if="cafeId" class="space-y-6">
      <!-- Feature selection -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          <li
            v-for="feature in allFeatures"
            :key="feature.id"
            class="px-4 py-4 sm:px-6"
          >
            <div class="flex items-center">
              <input
                :id="`feature-${feature.id}`"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                :checked="selectedFeatures.includes(feature.id)"
                @change="toggleFeature(feature.id)"
              />
              <label
                :for="`feature-${feature.id}`"
                class="ml-3 block text-sm font-medium text-gray-700"
              >
                {{ feature.name }}
              </label>
            </div>
          </li>
        </ul>
      </div>

      <!-- Add new feature -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Feature</h3>
        <div class="flex">
          <input
            v-model="newFeature"
            type="text"
            class="block w-full border border-gray-300 rounded-md shadow-sm p-2 mr-2"
            placeholder="Enter new feature name"
          />
          <button
            @click="addNewFeature"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            :disabled="loading || !newFeature.trim()"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Submit buttons -->
      <div class="flex justify-end">
        <button
          type="button"
          class="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          @click="router.back()"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="saveFeatures"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          :disabled="loading"
        >
          {{ loading ? 'Saving...' : 'Save Features' }}
        </button>
      </div>
    </div>
  </div>
</template>
