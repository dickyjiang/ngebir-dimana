<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold mb-4">Tentang Kami</h1>
      <p class="text-gray-500 text-justify mb-4">
        Dicky & Budi adalah dua sahabat sejak SMA yang kini juga menjadi rekan
        kerja dalam berbagai proyek. Dicky berperan sebagai UX/UI designer,
        sementara Budi adalah full stack developer. Kami berdua sangat menyukai
        kopi, dan dari kecintaan itulah lahir ide untuk membuat website
        ngopi.di-mana.com, sebuah platform yang mengumpulkan daftar lengkap cafe
        terdekat untuk tempat nongkrong dan ngopi nyaman bagi semua pecinta
        kopi. Website ini masih dalam tahap pengembangan dan kami baru memulai
        perjalanan ini. Kami menyadari bahwa data yang ada belum lengkap dan
        terus berusaha untuk memperbaikinya. Oleh karena itu, kami sangat
        terbuka bagi pengunjung maupun pemilik cafe yang ingin memberikan saran
        atau update data agar informasi yang kami sajikan semakin akurat dan
        bermanfaat. Terima kasih telah berkunjung dan mari bersama-sama
        menjadikan ngopi.di-mana.com sebagai referensi utama untuk menemukan
        cafe terdekat dan tempat nongkrong favorit Anda!
      </p>
    </div>
    <div class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold mb-4">About Us</h1>
      <p class="text-gray-500 text-justify mb-4">
        We’re Dicky & Budi, two high school friends who have also become colleagues working together on many projects. Dicky is a UX/UI designer, and Budi is a full stack developer. Both of us share a great love for coffee, and one day, we decided to create this website, ngopi.di-mana.com-a platform that lists all the nearby coffee shops for you to hang out and enjoy your coffee.
This website is still a work in progress, and we’re just getting started. We know it’s far from complete, and we’re continuously working to improve it. If you’re a visitor or a café owner and would like to suggest any updates or additions, we warmly welcome your input.
Thank you for stopping by! Let’s make ngopi.di-mana.com the go-to place to find the best nearby cafés and perfect spots for hanging out and enjoying your coffee.
If you want, I can help you format it nicely on your website as well!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeo } from "../composables/useSeo";

// Set SEO metadata

useSeo({
  title: "About Us - ngopi.di-mana.com",
  description:
    "Learn more about ngopi.di-mana.com and our mission to help people discover great cafes.",
  type: "website",
});
</script>

<style lang="postcss" scoped>
/* Add any component-specific styles here */
</style>
