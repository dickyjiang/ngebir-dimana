<!-- pages/cafe/owner/form/[id].vue -->
<template>
  <CafeForm
    :is-edit-mode="true"
    :cafe-id="cafeId"
    form-title="Edit Bar"
    submit-button-text="Update Bar"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'member'
})

  const route = useRoute();
  const cafeId = computed(() => route.params.id as string);
</script>
