<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DOMPurify from 'dompurify'
import BlogCard from '~/components/blog/BlogCard.vue'
import { useBlog } from '~/composables/useBlog'
import type { BlogPost } from '~/composables/useBlog'

const route = useRoute()
const slug = route.params.slug as string
const canonicalUrl = `https://ngopi.di-mana.com/blog/${slug}`

const supabase = useSupabaseClient()

const { data: post, pending: loading } = await useAsyncData(
  `blog-post-${slug}`,
  async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    return (data as BlogPost) ?? null
  }
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artikel tidak ditemukan', fatal: true })
}

// SEO — synchronous so tags are in the initial SSR HTML
const ogImage = post.value.cover_image_url || 'https://ngopi.di-mana.com/img/OG-img.png'

useSeoMeta({
  title: `${post.value.title} | Ngopi di Mana?`,
  description: post.value.description || post.value.title,
  ogTitle: `${post.value.title} | Ngopi di Mana?`,
  ogDescription: post.value.description || post.value.title,
  ogImage: ogImage,
  ogType: 'article',
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.value.title,
      description: post.value.description || '',
      image: ogImage,
      datePublished: post.value.published_at,
      dateModified: post.value.published_at,
      url: canonicalUrl,
      author: { '@type': 'Organization', name: 'Ngopi di Mana', url: 'https://ngopi.di-mana.com' },
      publisher: { '@type': 'Organization', name: 'Ngopi di Mana', url: 'https://ngopi.di-mana.com' },
    }),
  }],
})

// Related posts — not SEO-critical, fetched client-side
const { fetchRelatedPosts } = useBlog()
const relatedPosts = ref<BlogPost[]>([])

// Sanitized content for v-html rendering
const sanitizedContent = computed(() => {
  const raw = post.value?.content
  if (!raw) return ''
  if (import.meta.server) return raw  // DOMPurify requires a browser DOM; content is trusted DB data
  return DOMPurify.sanitize(raw)
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(async () => {
  if (post.value?.category) {
    relatedPosts.value = await fetchRelatedPosts(slug, post.value.category)
  }
})
</script>

<template>
  <div class="sm:max-w-[98%] mx-auto px-4 py-8">

    <!-- Skeleton -->
    <div v-if="loading">
      <div class="skeleton skeleton-text w-1/4 mb-4"></div>
      <div class="skeleton skeleton-image mb-6" style="height: 360px"></div>
      <div class="skeleton skeleton-text w-2/3"></div>
      <div class="skeleton skeleton-text w-full mt-2"></div>
      <div class="skeleton skeleton-text w-full mt-2"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="!post" class="text-center py-16">
      <p class="text-gray-500">Artikel tidak ditemukan.</p>
      <NuxtLink to="/blog" class="text-gray-800 underline mt-4 inline-block">← Kembali ke Blog</NuxtLink>
    </div>

    <!-- Article -->
    <article v-else class="max-w-3xl mx-auto">

      <!-- Breadcrumb -->
      <nav class="text-xs text-gray-400 mb-6 flex items-center gap-1">
        <NuxtLink to="/" class="hover:text-gray-600">Beranda</NuxtLink>
        <span>›</span>
        <NuxtLink to="/blog" class="hover:text-gray-600">Blog</NuxtLink>
        <span>›</span>
        <span class="text-gray-600 line-clamp-1">{{ post.title }}</span>
      </nav>

      <!-- Category + date -->
      <div class="flex items-center gap-2 mb-3">
        <span
          v-if="post.category"
          class="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-white font-medium"
        >{{ post.category }}</span>
        <span class="text-xs text-gray-400">{{ formatDate(post.published_at) }}</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-gray-800 mb-4 leading-snug">{{ post.title }}</h1>

      <!-- Description / lead -->
      <p v-if="post.description" class="text-lg text-gray-500 mb-6 leading-relaxed">
        {{ post.description }}
      </p>

      <!-- Cover image -->
      <div v-if="post.cover_image_url" class="rounded-lg overflow-hidden mb-8">
        <NuxtImg
          :src="post.cover_image_url"
          :alt="post.title"
          class="w-full object-cover max-h-[420px]"
          placeholder="/img/noimg.webp"
        />
      </div>

      <!-- Article content -->
      <div class="blog-content text-gray-700 leading-relaxed" v-html="sanitizedContent"></div>

    </article>

    <!-- Related posts -->
    <section v-if="relatedPosts.length > 0" class="mt-16 max-w-3xl mx-auto">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Artikel Terkait</h2>
      <ul class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BlogCard v-for="related in relatedPosts" :key="related.id" :post="related" />
      </ul>
    </section>

    <!-- Back link -->
    <div class="mt-10 max-w-3xl mx-auto">
      <NuxtLink to="/blog" class="text-sm text-gray-500 hover:text-gray-800 hover:underline">
        ← Semua Artikel
      </NuxtLink>
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

.skeleton-text { height: 1em; margin-bottom: 0.5em; width: 80%; }
.skeleton-image { width: 100%; }

/* Blog content typography — same pattern as .description-content in cafe/[id].vue */
.blog-content :deep(p) { margin-bottom: 1.25rem; }
.blog-content :deep(h2) { font-size: 1.4rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; color: #1f2937; }
.blog-content :deep(h3) { font-size: 1.15rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #374151; }
.blog-content :deep(a) { color: #3182ce; text-decoration: underline; }
.blog-content :deep(ul) { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
.blog-content :deep(ol) { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
.blog-content :deep(li) { margin-bottom: 0.25rem; }
.blog-content :deep(img) { max-width: 100%; border-radius: 0.5rem; margin: 1rem 0; }
.blog-content :deep(blockquote) { border-left: 3px solid #d1d5db; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1rem 0; }
</style>
