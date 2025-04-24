export const useFetchFilterOptions = async () => {
  try {
    const cities = await $fetch('/api/city', {
      headers: useRequestHeaders(['cookie']),
      method: 'get',
    });
    return cities && cities.length > 0 ? cities : [];
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return [];
  }
}