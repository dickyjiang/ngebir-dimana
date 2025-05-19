<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold mb-4">Tentang Ngopi di Mana</h1>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Ngopi di Mana adalah direktori yang dikurasi secara khusus untuk
        membantu para penikmat kopi menemukan kafe dan kedai kopi di seluruh
        Indonesia. Tujuan kami adalah menyederhanakan proses pencarian tempat
        ngopi—baik untuk bekerja, bersantai, maupun sekadar menikmati secangkir
        kopi yang nikmat.

        <br /><br />Informasi yang disajikan di situs ini berasal dari data
        publik serta kontribusi komunitas. Kami berupaya untuk menyajikan daftar
        yang akurat dan informatif, termasuk nama kafe, lokasi, jam operasional,
        serta tag suasana seperti cozy, minimalis, open space, atau pet-friendly
        guna membantu pengguna menemukan tempat yang sesuai dengan preferensi
        mereka.

        <br /><br />Harap diperhatikan: Kami tidak memiliki afiliasi dengan
        kafe, jaringan kopi, atau kelompok usaha manapun. Seluruh data
        disediakan semata-mata untuk tujuan informasi.

        <br /><br />Platform ini dikembangkan dan dikelola secara independen
        sebagai inisiatif non-komersial, didorong oleh ketertarikan terhadap
        teknologi digital, eksplorasi, dan budaya kopi Indonesia.
      </p>
      <h2 class="text-xl font-semibold mt-6 mb-2">Ingin Berkontribusi?</h2>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Kami terbuka terhadap masukan, saran, maupun permintaan pembaruan data.
        Jika Anda ingin merekomendasikan sebuah kafe atau mengoreksi informasi
        yang ada, silakan hubungi kami di
        <a
          href="mailto:info-ngopi@di-mana.com"
          class="text-gray-700 font-semibold hover:underline"
          >info-ngopi@di-mana.com</a
        >.
      </p>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Terima kasih telah mengunjungi Ngopi di Mana! Kami berharap Anda
        menemukan tempat ngopi favorit Anda bersama kami.
      </p>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Selamat menikmati!
      </p>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Dicky & Budi
      </p>
    </div>
    <div class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold mb-4">About Ngopi di Mana</h1>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Ngopi di Mana is a curated directory dedicated to helping coffee
        enthusiasts discover cafés and coffee shops across Indonesia. Our goal
        is to simplify the search for great coffee spots—whether you’re looking
        for a place to work remotely, catch up with friends, or simply enjoy a
        good cup of coffee. <br /><br />

        The information presented on this site is sourced from publicly
        available data and community contributions. We strive to provide
        accurate and helpful listings, including café names, locations, business
        hours, and atmosphere tags such as cozy, minimalist, open space, or
        pet-friendly to assist users in finding a venue that suits their needs.

        <br /><br />Please note: We are not affiliated with any cafés, coffee
        chains, or hospitality groups. All data provided is for informational
        purposes only.

        <br /><br />This platform is independently developed and maintained as a
        non-commercial initiative, driven by a passion for digital tools,
        exploration, and the Indonesian coffee culture.
      </p>
      <h2 class="text-xl font-semibold mt-6 mb-2">Want to Contribute?</h2>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        We welcome feedback, suggestions, or requests for edits. If you would
        like to recommend a café or correct an existing listing, please contact
        us at
        <a
          href="mailto:info-ngopi@di-mana.com"
          class="text-gray-700 font-semibold hover:underline"
          >info-ngopi@di-mana.com</a
        >.
      </p>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Thank you for visiting Ngopi di Mana! We hope you find your next
        favorite coffee spot with us.
      </p>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Happy sipping!
      </p>
      <p class="text-gray-500 text-justify mb-4 leading-relaxed">
        Dicky & Budi
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
