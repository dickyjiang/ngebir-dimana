<template>
  <div
    class="flex items-center justify-center sm:justify-between w-full p-2 max-w-[90%] lg:max-w-[98%] mx-auto bg-white border-t-2 border-b-2 border-gray-800 my-2"
  >
    <!-- Add back arrow for mobile -->
    <button
      @click="goBack"
      class="sm:hidden absolute left-4 flex items-center justify-center"
      aria-label="Go back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <div class="flex gap-4 items-end">
      <a href="/">
        <!-- <img src="/src/assets/img/logo_ndm.svg" alt="logo" class="h-6"> -->
        <div class="flex items-center">
          <h2 class="mt-3">Ngopi</h2>
          <div id="logo-animate" class="w-10">
            <!-- Lottie animation will be rendered here -->
          </div>
          <h2 class="mt-3">dimana</h2>
        </div>
      </a>
        <p class="hidden sm:flex font-semibold text-sm mb-1">
          Satu Klik, Ribuan Cafe! Temukan yang Pas untuk Kamu.
        </p>
    </div>

    <div id="navMenu" class="flex items-center gap-2 ">
      <!-- <NuxtLink to="/cafe/owner/add" class="hidden sm:flex">
        add cafe
      </NuxtLink> -->
      <div class="flex items-center gap-1">
        <p class="text-sm text-gray-600">Mau nambah cafe kamu?</p> 
        <NuxtLink to="/login" class="text-sm font-semibold hidden sm:flex border px-3 py-2 rounded-lg border-none transition-colors hover:bg-black hover:text-yellow-500 ">Registrasi</NuxtLink> 
      </div>
      <div class="flex items-center gap-1">
        <p class="text-sm text-gray-600">Sudah punya akun?</p> 
        <NuxtLink to="/login" class="text-sm font-semibold hidden sm:flex border px-3 py-2 rounded-lg border-none transition-colors hover:bg-black hover:text-yellow-500  "> Login </NuxtLink>
      </div>
      <!-- <button class="logout-button" @click="handleLogout">Logout</button> -->
    </div>
  </div>
</template>

<script setup>
  import { onMounted, onBeforeUnmount } from 'vue';
  import animationData from '../public/animations/coffee-shop.json';

  const router = useRouter();
  const supabase = useSupabaseClient();
  let anim = null;

  // Add goBack function
  const goBack = () => {
    window.history.back();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  onMounted(async () => {
    if (typeof window !== 'undefined') {
      const lottie = (await import('lottie-web')).default;
      const container = document.getElementById('logo-animate');

      anim = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
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
