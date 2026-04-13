<script setup lang="ts">
import type { BlogPost } from '~/composables/useBlog'

defineProps<{ post: BlogPost }>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <li class="rounded-md flex flex-col h-full pb-4 border overflow-hidden bg-white flex-shrink-0 w-[calc((100vw-3.5rem)/3)] sm:flex-1 sm:min-w-0 sm:w-auto transition-shadow hover:shadow-md hover:border-gray-300 cursor-pointer">
    <NuxtLink :to="`/blog/${post.slug}`" class="flex flex-col h-full">
      <NuxtImg
        :src="post.cover_image_url || ''"
        :alt="post.title"
        class="w-full h-24 sm:h-48 object-cover"
        placeholder="/img/noimg.webp"
      />
      <div class="flex-1 flex flex-col px-2 pt-2 sm:px-4 sm:pt-3">
        <div class="hidden sm:flex items-center gap-2 mb-1">
          <span
            v-if="post.category"
            class="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-white font-medium"
          >{{ post.category }}</span>
          <span class="text-xs text-gray-400">{{ formatDate(post.published_at) }}</span>
        </div>
        <h2 class="text-xs sm:text-base text-gray-800 font-semibold leading-tight line-clamp-2 mt-1">
          {{ post.title }}
        </h2>
        <p class="hidden sm:block text-sm text-gray-500 overflow-hidden mt-2" style="-webkit-line-clamp:2;line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden">
          {{ post.description }}
        </p>
      </div>
    </NuxtLink>
  </li>
</template>
