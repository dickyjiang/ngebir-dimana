<template>
    <div class="flex items-center justify-between w-full p-2 bg-gray-900 py-8">
      <div class="max-w-7xl w-full mx-auto flex flex-col gap-4 sm:flex-row items-center justify-between">
        <div>
          <a href="https://ngopi.di-mana.com/">
            <img src="/src/assets/img/logo_ndm_gray.svg" alt="Ngopi di Mana - Direktori Cafe Indonesia" class="h-6" />
          </a>
        </div>
        <div>
          <p class="text-gray-500 px-7 text-sm text-center sm:text-left">
            ©2026 ISUKJADI All rights reserved | email: <span><a href="mailto:info-ngopi@di-mana.com">info-ngopi@di-mana.com</a></span> 
          </p>
        </div>
        <div class="flex gap-4">
            <NuxtLink to="/privacy-policy" class="text-gray-500 hover:text-gray-400">Privacy Policy</NuxtLink>
            <NuxtLink to="/disclaimer" class="text-gray-500 hover:text-gray-400">Disclaimer</NuxtLink>
            <NuxtLink to="/about-us" class="text-gray-500 hover:text-gray-400">About Us</NuxtLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Add any script logic if needed in the future
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>