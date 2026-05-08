<!-- pages/cafe/owner/form/index.vue -->
<template>
  <CafeForm
    :is-edit-mode="false"
    :cafe-id="null"
    form-title="Add New Bar"
    :business-types="businessTypesArray"
    submit-button-text="Add Bar" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'member',
})
const route = useRoute()
const businessType = computed(() => (route.query.business_type as string) || null)

// Convert to array for the component
const businessTypesArray = computed(() => {
  if (!businessType.value) return []

  // If the query parameter is already an array, use it
  if (Array.isArray(businessType.value)) {
    return businessType.value
  }

  // Otherwise, turn the single string into an array
  return [businessType.value]
})

// Simply use the shared component
</script>
