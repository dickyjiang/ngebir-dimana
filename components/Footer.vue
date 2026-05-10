<template>
    <div class="flex items-center justify-between w-full p-2 bg-gradient-to-t from-amber-600 to-yellow-400 py-8">
      <div class="max-w-7xl w-full mx-auto flex flex-col gap-4 sm:flex-row items-center justify-between">
        <div>
          <a href="https://ngebir-dimana.com/">
            <img src="/src/assets/img/BDM-footer.svg" alt="Ngebir Dimana" class="h-10" />
          </a>
        </div>
        <div>
          <p class="text-gray-800 px-7 text-sm text-center sm:text-left">
            ©2026 ISUKJADI All rights reserved | email: <span><a href="mailto:info-ngebir@di-mana.com">info-ngebir@di-mana.com</a></span> 
          </p>
        </div>
        <div class="flex gap-4">
            <NuxtLink to="/privacy-policy" class="text-gray-800 hover:text-gray-600">Privacy Policy</NuxtLink>
            <NuxtLink to="/disclaimer" class="text-gray-800 hover:text-gray-600">Disclaimer</NuxtLink>
            <NuxtLink to="/about-us" class="text-gray-800 hover:text-gray-600">About Us</NuxtLink>
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