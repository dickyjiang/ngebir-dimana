<script setup lang="ts">
  import { ref, computed } from 'vue';

  // Define props for the component
  const props = defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
    cafes: {
      type: Array,
      default: () => [],
    },
    itemsPerPage: {
      type: Number,
      default: 24,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    bannerPosition: { // Add this prop
      type: Number,
      default: 12 // Show banner after 6th item by default
    }
  });

  // Define emits to pass events back to parent
  const emit = defineEmits(['page-change']);

  // Computed property for visible page numbers in pagination
  const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 5;
    const startPage = Math.max(
      1,
      props.currentPage - Math.floor(maxVisible / 2)
    );
    const endPage = Math.min(props.totalPages, startPage + maxVisible - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  });

  const listContainer = ref(null);

  function changePage(page) {
    if (page >= 1 && page <= props.totalPages) {
      emit('page-change', page);
      // Scroll to top of the list container
      listContainer.value?.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<template>
  <div ref="listContainer">
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        v-for="n in itemsPerPage"
        :key="n"
        class="rounded-md flex flex-col h-full pb-4 border overflow-hidden">
        <div class="skeleton skeleton-image"></div>
        <div class="flex-1 flex-col px-4">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <template v-for="(cafe, index) in cafes" :key="cafe.id">
          <li
            class="rounded-md flex flex-col h-full pb-4 border overflow-hidden"
          >
            <NuxtLink :to="`/cafe/${cafe.slug_name}`" class="flex flex-col h-full">
              <NuxtImg
                alt="Cafe Image"
                class="w-full h-48 object-cover mb-4"
                :src="cafe.photo"
                placeholder="/img/noimg.webp"
              />
              <div class="flex-1 flex flex-col px-4">
                <div class="flex-1">
                  <h2 class="text-lg text-gray-800 leading-tight line-clamp-2 font-semibold">
                    {{ cafe.name }}
                  </h2>
                  <p class="text-sm text-gray-500 line-clamp-2 mt-2">
                    {{ cafe.description }}
                  </p>
                </div>
                
                <div class="flex justify-between mt-8">
                  <div class="flex items-center gap-1">
                    <img
                      src="/src/assets/img/city.svg"
                      alt="location"
                      class="h-3"
                    />
                    <p class="text-gray-500 text-xs">{{ cafe.city }}</p>
                  </div>
                  <div class="flex items-center gap-1 font-semibold">
                    <p class="text-gray-500 text-xs">{{ cafe.range }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <img src="/src/assets/img/rating.svg" alt="star" class="h-3" />
                    <p class="text-gray-500 text-xs">{{ cafe.rating_num }}</p>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </li>
          <!-- Add banner after specified position -->
          <div v-if="index + 1 === bannerPosition" class="col-span-full">
            <div class="bg-[#FFFDEE] shadow-lg p-2 rounded-lg text-center flex gap-4 items-center justify-between">
              <!-- Your banner content here -->
               <img src="/src/assets/img/world_of_coffee_jakarta_2025.png" alt="world_of_coffee_jakarta_2025" class=" h-24 object-cover">
               <div>
                 <h3 class="text- font-bold text-[#F15A2D] mb-2">Pameran World of Coffee 2025 Hadir di Jakarta Bersamaan dengan World Brewers Cup</h3>
                 <p class="text-gray-600 text-sm">15-17 Mei 2025 di Jakarta International Convention Center (JICC), Indonesia</p>
               </div>
               <img src="/src/assets/img/world_of_coffee_jakarta_2025_wwc-jakarta.png" alt="wcc-jakarta-2025" class=" h-12 object-cover">
            </div>
          </div>
        </template>
      </div>
      <div class="flex justify-center mt-4 space-x-2">
        <span
          v-if="currentPage > 1"
          @click="changePage(currentPage - 1)"
          class="cursor-pointer text-gray-500 hover:underline"
        >
          Previous
        </span>
        <span
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="{
            'font-bold text-gray-800': currentPage === page,
            'text-gray-700': currentPage !== page,
          }"
          class="cursor-pointer hover:underline"
        >
          {{ page }}
        </span>
        <span
          v-if="currentPage < totalPages"
          @click="changePage(currentPage + 1)"
          class="cursor-pointer text-gray-800 hover:underline"
        >
          Next
        </span>
        <span
          v-if="currentPage < totalPages && !visiblePages.includes(totalPages)"
          @click="changePage(totalPages)"
          class="cursor-pointer text-gray-800 hover:underline"
        >
          Last ({{ totalPages }})
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Skeleton loading styles */
  .skeleton {
    background-color: #e0e0e0;
    border-radius: 4px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }

  .skeleton-text {
    height: 1em;
    margin-bottom: 0.5em;
    width: 80%;
  }

  .skeleton-image {
    height: 150px;
    width: 100%;
    margin-bottom: 1em;
  }
</style>
