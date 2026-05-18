<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BlogCard from '~/components/blog/BlogCard.vue'
import { useBlog } from '~/composables/useBlog'

useSeoMeta({
  title: 'Blog | Ngebir Dimana?',
  description: 'Tips, panduan, dan artikel seputar bar dan bir di Indonesia. Temukan rekomendasi terbaik dari Ngebir Dimana.',
  ogTitle: 'Blog | Ngebir Dimana?',
  ogDescription: 'Tips, panduan, dan artikel seputar bar dan bir di Indonesia.',
  ogImage: 'https://ngebir.di-mana.com/img/OG-img.png',
  ogType: 'website',
  ogUrl: 'https://ngebir.di-mana.com/blog',
})
useHead({ link: [{ rel: 'canonical', href: 'https://ngebir.di-mana.com/blog' }] })

const MD_BREAKPOINT = 768
const itemsPerPage = ref(9)
const currentPage = ref(1)

const { posts, loading, total, fetchPosts } = useBlog()

const totalPages = computed(() => Math.ceil(total.value / itemsPerPage.value))

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

async function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await fetchPosts(page, itemsPerPage.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function getItemsPerPage() {
  return window.innerWidth < MD_BREAKPOINT ? 8 : 9
}

async function onResize() {
  const next = getItemsPerPage()
  if (next !== itemsPerPage.value) {
    itemsPerPage.value = next
    currentPage.value = 1
    await fetchPosts(1, next)
  }
}

onMounted(() => {
  itemsPerPage.value = getItemsPerPage()
  fetchPosts(1, itemsPerPage.value)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="sm:max-w-[98%] mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Blog</h1>
      <p class="text-gray-500 mt-1 text-sm">Tips, panduan, dan artikel seputar bar dan bir di Indonesia.</p>
    </div>

    <!-- Skeleton loading -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="n in itemsPerPage"
        :key="n"
        class="rounded-md flex flex-col h-full pb-4 border overflow-hidden"
      >
        <div class="skeleton skeleton-image"></div>
        <div class="px-4 pt-3">
          <div class="skeleton skeleton-text w-1/3"></div>
          <div class="skeleton skeleton-text mt-2"></div>
          <div class="skeleton skeleton-text w-3/4"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="posts.length === 0" class="text-center py-16">
      <p class="text-gray-500">Belum ada artikel. Nantikan konten terbaru dari kami!</p>
    </div>

    <!-- Posts grid -->
    <ul v-else class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BlogCard v-for="post in posts" :key="post.id" :post="post" />
    </ul>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8 space-x-2">
      <span
        v-if="currentPage > 1"
        class="cursor-pointer text-gray-500 hover:underline"
        @click="changePage(currentPage - 1)"
      >Previous</span>
      <span
        v-for="page in visiblePages"
        :key="page"
        class="cursor-pointer hover:underline"
        :class="{ 'font-bold text-gray-800': currentPage === page, 'text-gray-600': currentPage !== page }"
        @click="changePage(page)"
      >{{ page }}</span>
      <span
        v-if="currentPage < totalPages"
        class="cursor-pointer text-gray-800 hover:underline"
        @click="changePage(currentPage + 1)"
      >Next</span>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
  width: 80%;
}

.skeleton-image {
  height: 192px;
  width: 100%;
}
</style>
