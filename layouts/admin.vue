<template>
  <div class="flex flex-col min-h-screen">
    <Nav />
    <div class="border-b border-gray-200 bg-white">
      <div class="max-w-5xl mx-auto px-4 py-2 flex gap-2">
        <NuxtLink
          to="/admin/review"
          :class="
            route.path === '/admin/review'
              ? 'bg-black text-yellow-500 border-yellow-500'
              : 'text-gray-600 border-gray-300 hover:bg-gray-50'
          "
          class="px-4 py-1.5 rounded-full border text-xs font-medium transition-colors">
          Bar Review
        </NuxtLink>
        <NuxtLink
          to="/admin/blog-review"
          :class="
            route.path === '/admin/blog-review'
              ? 'bg-black text-yellow-500 border-yellow-500'
              : 'text-gray-600 border-gray-300 hover:bg-gray-50'
          "
          class="px-4 py-1.5 rounded-full border text-xs font-medium transition-colors">
          Blog Review
        </NuxtLink>
        <NuxtLink
          to="/admin/ig-queue"
          :class="
            route.path === '/admin/ig-queue'
              ? 'bg-black text-yellow-500 border-yellow-500'
              : 'text-gray-600 border-gray-300 hover:bg-gray-50'
          "
          class="px-4 py-1.5 rounded-full border text-xs font-medium transition-colors">
          IG Queue
        </NuxtLink>
      </div>
    </div>
    <div class="flex-1">
      <slot />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Nav from '~/components/NavbarMember.vue'
import Footer from '~/components/Footer.vue'
import { useSeo } from '~/composables/useSeo'

const route = useRoute()

useSeo({
  title: 'Admin · Ngebir Dimana',
  description: 'Admin panel',
  image: '/img/OG-img.png',
  url: 'https://ngebir.di-mana.com',
  type: 'website',
})
</script>
