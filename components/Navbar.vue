<template>
  <div class="flex items-center justify-center sm:justify-between w-full p-2 max-w-[90%] lg:max-w-[98%] mx-auto bg-white border-t-2 border-b-2 border-gray-800 my-2">
    <a href="/">
      <!-- <img src="/src/assets/img/logo_ndm.svg" alt="logo" class="h-6"> -->
      <div class="flex items-center">
        <h2 class="mt-3">Ngopi</h2>
        <div id="logo-animate" class="w-10 ">
          <!-- Lottie animation will be rendered here -->
        </div>
        <h2 class="mt-3">dimana</h2>
      </div>
    </a>
    <div class="flex items-center gap-2">
      <p class="hidden sm:flex mt-3 font-semibold text-sm">Satu Klik, Ribuan Cafe! Temukan yang Pas untuk Kamu.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import animationData from '../public/animations/coffee-shop.json';

let anim = null;

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const lottie = (await import('lottie-web')).default;
    const container = document.getElementById('logo-animate');
    
    anim = lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData
    });
  }
});

onBeforeUnmount(() => {
  if (anim) {
    anim.destroy();
  }
});
</script>

<style scoped>
@font-face {
    font-family: 'Sharp Grotesk';
    src: url('~/assets/fonts/sharp-grotesk-medium-25-regular.woff')
      format('woff');
    font-weight: normal;
    font-style: normal;
  }

  h2 {
    font-family: 'Sharp Grotesk', sans-serif; /* Fallback to sans-serif */
  }
</style>