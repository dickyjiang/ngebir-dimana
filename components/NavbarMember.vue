<template>
  <div
    class="relative flex items-center justify-between w-full p-2 max-w-[90%] lg:max-w-[98%] mx-auto bg-white border-t-2 border-b-2 border-gray-800 my-2"
  >
    <!-- Back arrow remains at left -->
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

    <!-- Center the logo and text -->
    <div class="flex-1 flex justify-center sm:justify-start">
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
    </div>

    <!-- Burger menu positioned at far right -->
    <button
      @click="toggleMenu"
      class="sm:hidden flex items-center ml-auto"
      aria-label="Toggle menu"
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
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Mobile menu overlay -->
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
      @click="toggleMenu"
    ></div>

    <!-- Modified nav menu -->
    <div
      id="navMenu"
      :class="{
        'fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 flex-col p-4 transform transition-transform duration-300 ease-in-out': true,
        'translate-x-0': isMenuOpen,
        'translate-x-full': !isMenuOpen,
        'sm:translate-x-0 sm:static sm:h-auto sm:w-auto sm:shadow-none sm:flex-row sm:p-0': true,
      }"
      class="flex items-center gap-2"
    >
      <!-- Close button for mobile menu -->
      <button
        @click="toggleMenu"
        class="sm:hidden absolute top-4 right-4"
        aria-label="Close menu"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-2 mt-12 sm:mt-0"
      >
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center gap-1"
        >
          <div v-if="!data.session">
            <p class="text-sm text-gray-600">Sudah punya akun?</p>
            <NuxtLink
              to="/login"
              class="text-sm font-semibold flex border px-3 py-2 rounded-lg border-none transition-colors hover:bg-black hover:text-yellow-500"
            >
              Login
            </NuxtLink>
          </div>

          <div v-if="data.session" class="flex flex-col sm:flex-row items-center gap-2">
            <NuxtLink
              to="/cafe/owner/form"
              class="flex text-sm font-semibold  border px-3 py-2 rounded-lg border-none transition-colors hover:bg-black hover:text-yellow-500"
            >
              add cafe
            </NuxtLink>
            <NuxtLink
              to="/cafe/owner/form"
              class="flex text-sm font-semibold  border px-3 py-2 rounded-lg border-none transition-colors hover:bg-black hover:text-yellow-500"
            >
              add Roastery
            </NuxtLink>
            <NuxtLink
              to="/cafe/owner/form"
              class="flex text-sm font-semibold  border px-3 py-2 rounded-lg border-none transition-colors hover:bg-black hover:text-yellow-500"
            >
              add Cafe Supplies
            </NuxtLink>

            <NuxtLink to="/profile">
              <button
                class="text-sm font-semibold flex border px-3 py-2 rounded-lg border-none transition-colors hover:bg-black hover:text-yellow-500"
              >
                Profile
              </button>
            </NuxtLink>

            <button
              class="text-sm font-semibold flex border px-3 py-2 rounded-lg border-none transition-colors hover:bg-black hover:text-yellow-500"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import animationData from "../public/animations/coffee-shop.json";

const router = useRouter();
const supabase = useSupabaseClient();
let anim = null;
const { data } = await supabase.auth.getSession();

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Close menu when route changes
watch(
  () => router.currentRoute.value.path,
  () => {
    isMenuOpen.value = false;
  }
);

// Add goBack function
const goBack = () => {
  window.history.back();
};

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    reloadNuxtApp({
      path: "/",
      ttl: 1000, // default 10000
    });
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

onMounted(async () => {
  if (typeof window !== "undefined") {
    const lottie = (await import("lottie-web")).default;
    const container = document.getElementById("logo-animate");

    anim = lottie.loadAnimation({
      container: container,
      renderer: "svg",
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
  font-family: "Sharp Grotesk";
  src: url("~/assets/fonts/sharp-grotesk-medium-25-regular.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}

h2 {
  font-family: "Sharp Grotesk", sans-serif; /* Fallback to sans-serif */
}

:global(body.menu-open) {
  overflow: hidden;
}
</style>
