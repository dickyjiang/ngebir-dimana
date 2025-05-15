<template>
  <div class="flex flex-col min-h-screen">
    <Nav />
    <div class="flex-1 pb-4">
      <slot />
    </div>

    <Footer />
  </div>
</template>

<script setup>
  import Nav from '~/components/Navbar.vue';
  import Footer from '~/components/Footer.vue';
  import { useSeo } from '~/composables/useSeo';

  // Default SEO setup for all pages
  useSeo({
    title: 'Website Paling Lengkap buat Cari Tempat Ngopi!',
    description: 'Satu Klik, Ribuan Cafe! Temukan yang Pas untuk Kamu.',
    image: '/img/OG-img.png',
    url: 'https://ngopi.di-mana.com',
    type: 'website',
  });
</script>

<style scoped></style>
