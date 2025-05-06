export const useFetchFilterOptions = async () => {
  try {
    const cityData = await $fetch('/api/city', {
      headers: useRequestHeaders(['cookie']),
      method: 'get',
    });

    return {
      parentCities: cityData?.parentCities || [],
      childCities: cityData?.childCities || []
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      parentCities: [],
      childCities: []
    };
  }
}