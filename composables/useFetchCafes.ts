import { ref } from 'vue';

export function useFetchCafes() {
    const data = ref([]);
    const loading = ref(true);
    const totalCafes = ref(0);

    /**
     * Fetches cafe data with pagination and filtering
     * @param page Current page number
     * @param itemsPerPage Number of items per page
     * @param filters Filter options (city, features, etc.)
     * @param searchQuery Search query string
     * @param isNearbyActive Whether nearby location filter is active
     * @param userLocation User's location coordinates
     */
    async function fetchCafes(
        page: number,
        itemsPerPage: number,
        filters = null,
        searchQuery = '',
        isNearbyActive = false,
        userLocation = null
    ) {
        loading.value = true;

        // Simplify range calculation to always get correct number of items
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1; // Remove the -1 to include full range

        try {
            let payload: any = {
                from,
                to,
                requestedItems: itemsPerPage,
                page
            };

            // Add detailed request logging

            if (filters) {
                payload = {
                    ...payload,
                    city: filters.city || [],
                    searchQuery: searchQuery || '',
                    features: filters.features || [],
                };
            }

            const hasil = await $fetch('/api/search', {
                method: 'POST',
                body: payload,
                headers: useRequestHeaders(['cookie']),
            });


            if (hasil.data?.length < itemsPerPage) {
                console.warn('Pagination Mismatch:', {
                    expected: itemsPerPage,
                    received: hasil.data?.length,
                    difference: itemsPerPage - hasil.data?.length
                });
            }

            totalCafes.value = hasil.count || 0;
            data.value = hasil.data || [];

        } catch (err) {
            console.error('Fetch Error:', err);
        } finally {
            loading.value = false;
        }
    }

    return {
        data,
        loading,
        totalCafes,
        fetchCafes
    };
}