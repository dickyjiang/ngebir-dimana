<template>
    <div class="flex flex-col min-h-screen px-2">
        <Nav />
      <div class="flex-1">
        <slot />
  
      </div>
  
      <Footer />
  
    </div>
  </template>
  
  <script setup>
  import Nav from '~/components/Navbar.vue'
  import Footer from '~/components/Footer.vue';
  </script>
  
  <style scoped>
  </style>
  