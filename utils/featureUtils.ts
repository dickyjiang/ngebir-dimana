
/**
 * Interface for Feature objects
 */
export interface Feature {
    id: string;
    name: string;
    business_type: string;
    [key: string]: any;
}

/**
 * Filters features based on a search query
 * @param features Array of features to filter
 * @param query Search query string
 * @returns Filtered array of features
 */
export const filterFeatures = (features: Feature[], query: string): Feature[] => {
    if (!query || query.trim() === '') {
        return features;
    }

    return features.filter((feature) =>
        feature.name?.toLowerCase().includes(query.toLowerCase())
    );
};

/**
 * Checks if a feature is in the selected features array
 * @param feature Feature to check
 * @param selectedFeatures Array of selected features
 * @returns Boolean indicating if the feature is selected
 */
export const isFeatureSelected = (feature: Feature, selectedFeatures: Feature[]): boolean => {
    return selectedFeatures.some((selected) => selected.id === feature.id);
};

/**
 * Toggles a feature's selection status
 * @param feature Feature to toggle
 * @param selectedFeatures Reference to the selected features array
 */
export const toggleFeatureSelection = (feature: Feature, selectedFeatures: Ref<Feature[]>): void => {
    const index = selectedFeatures.value.findIndex(
        (selected) => selected.id === feature.id
    );

    if (index === -1) {
        selectedFeatures.value.push(feature);
    } else {
        selectedFeatures.value.splice(index, 1);
    }
};

/**
 * Removes a feature from the selected features
 * @param feature Feature to remove
 * @param selectedFeatures Reference to the selected features array
 */
export const removeSelectedFeature = (feature: Feature, selectedFeatures: Ref<Feature[]>): void => {
    const index = selectedFeatures.value.findIndex(
        (selected) => selected.id === feature.id
    );
    if (index !== -1) {
        selectedFeatures.value.splice(index, 1);
    }
};