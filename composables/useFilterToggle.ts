import { useRouter } from 'vue-router';

export function useFilterToggle() {
    const router = useRouter();

    const toggleFilter = async (activeFilters, type, value) => {
        const index = activeFilters[type].indexOf(value);
        if (index > -1) {
            activeFilters[type].splice(index, 1);
        } else {
            activeFilters[type].push(value);
        }

        await router.push({
            path: '/cafes',
            query: {
                city: activeFilters.city.join(','),
                features: activeFilters.features.join('-'),
            },
        });
    };

    const toggleFeature = async (activeFilters, feature_id) => {
        const index = activeFilters['features'].indexOf(feature_id);
        if (index > -1) {
            activeFilters['features'].splice(index, 1);
        } else {
            activeFilters['features'].push(feature_id);
        }

        await router.push({
            path: '/cafes',
            query: {
                city: activeFilters.city.join(','),
                features: activeFilters['features'].join(','),
            },
        });
    };

    return {
        toggleFilter,
        toggleFeature,
    };
}