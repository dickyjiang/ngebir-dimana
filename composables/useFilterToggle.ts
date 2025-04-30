export function useFilterToggle() {
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
  };

  return {
    toggleFilter
  };
};