import { useRouter } from 'vue-router';

export function useFilterToggle() {

  const router = useRouter();
  const toggleFilter = async (filters, type, value, isReset = false) => {
    if (isReset) {
      filters[type] = [];
      return;
    }
    const index = filters[type].indexOf(value);
    if (index > -1) {
      filters[type].splice(index, 1);
    } else {
      filters[type].push(value);
    }
    await router.push({
      path: '/cafes',
      query: {
        city: filters.city.join(','),
        features: filters.features.join(','),
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


  const resetFiltersCity = async (filters) => {
    await toggleFilter(filters, 'city', null, true);

    await router.push({
      path: '/cafes',
      query: {
        city: filters.city.join(','),
        features: filters['features'].join(','),
      },
    });
  }

  const resetFiltersFeature = async (filters) => {
    await toggleFilter(filters, 'features', null, true);

    await router.push({
      path: '/cafes',
      query: {
        city: filters.city.join(','),
        features: filters['features'].join(','),
      },
    });
  }




  return {
    toggleFilter,
    toggleFeature,
    resetFiltersCity,
    resetFiltersFeature
  };
};