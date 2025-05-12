<template>
    <div class="flex items-center justify-between w-full p-2 bg-gray-900 py-8">
      <div class="max-w-7xl w-full mx-auto flex flex-col gap-4 sm:flex-row items-center justify-between">
        <div>
          <img src="/src/assets/img/logo_ndm_gray.svg" alt="logo" class="h-6" />
        </div>
        <div>
          <p class="text-gray-500 px-7 text-sm text-center sm:text-left">
            ©2025 ISUKJADI All rights reserved | email: <span><a href="mailto:dicky@dickyjiang.com">si DIKKI</a></span> atau <span><a href="mailto:budi@avasoft.co">si BUDI</a></span>
          </p>
        </div>
        <div class="flex gap-4">
            <NuxtLink to="/privacy-policy" class="text-gray-500 hover:text-gray-400">Privacy Policy</NuxtLink>
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