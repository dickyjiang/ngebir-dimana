<!-- pages/cafe/owner/form/[id].vue -->
<template>
  <CafeForm
    :is-edit-mode="true"
    :cafe-id="cafeId"
    form-title="Edit Cafe"
    submit-button-text="Update Cafe"
  />
</template>

<script setup lang="ts">
  const route = useRoute();
  const cafeId = computed(() => route.params.id as string);
</script>
