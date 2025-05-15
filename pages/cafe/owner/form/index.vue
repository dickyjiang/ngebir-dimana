<!-- pages/cafe/owner/form/index.vue -->
<template>
  <CafeForm 
    :is-edit-mode="false" 
    :cafe-id="null" 
    form-title="Add New Cafe" 
    submit-button-text="Add Cafe"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'member'
})
// Simply use the shared component
</script>