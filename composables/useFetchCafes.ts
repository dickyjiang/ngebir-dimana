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

        // Calculate range based on current page
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        try {
            let payload: any = {};

            if (filters) {
                payload = {
                    city: filters.city || [],
                    from: from,
                    to: to,
                    searchQuery: searchQuery || '',
                    features: filters.features || [],
                };

                if (isNearbyActive && userLocation) {
                    payload.cariLocation = true;
                    payload.latitude = userLocation.latitude || null;
                    payload.longitude = userLocation.longitude || null;
                }
            }

            const hasil = await $fetch('/api/search', {
                method: 'POST',
                body: payload,
                headers: useRequestHeaders(['cookie']),
            });

            totalCafes.value = hasil.count || 0;
            data.value = hasil.data || [];
        } catch (err) {
            console.error('Exception while fetching cafes:', err);
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