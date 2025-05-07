export const useFetchFeatures = async () => {
    try {
        const features = await $fetch('/api/features', {
            headers: useRequestHeaders(['cookie']),
            method: 'get',
        });

        return {
            features: features || []
        };
    } catch (error) {
        console.error('Error fetching features:', error);
        return {
            features: []
        };
    }
}