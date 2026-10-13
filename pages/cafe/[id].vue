<script setup>
// Legacy URL (/cafe/:slug) from the NDM fork. Public bar pages now live at /bars/:slug.
// Static siblings (owner/, feature/) take precedence over this dynamic route.
const route = useRoute()
await navigateTo(`/bars/${route.params.id}`, { redirectCode: 301, replace: true })
</script>

<template>
  <div />
</template>
