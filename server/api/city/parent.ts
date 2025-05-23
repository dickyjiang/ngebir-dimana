import { createError } from "h3";
import type { Database } from "~~/types/database.types";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);

    // Get all cities with their parent information in a single query
    const { data: allCities, error } = await client.from('city')
        .select('city_name, city_slug, city_parent')
        .order('city_name', { ascending: true });

    if (error) throw createError({ statusMessage: error.message });

    // Filter cities with parent values
    const citiesWithParent = allCities?.filter(city => city.city_parent) || [];

    // Get unique parent slugs
    const uniqueParents = [...new Set(citiesWithParent.map(city => city.city_parent))];

    // Create the result structure
    const parentCitiesWithChildren = [];

    for (const parentSlug of uniqueParents) {
        // Find the parent city details from all cities
        const parentCity = allCities.find(city => city.city_slug === parentSlug);

        if (parentCity) {
            // Find all child cities for this parent, excluding the one with the same slug as parent
            const childCities = citiesWithParent
                .filter(city => city.city_parent === parentSlug && city.city_slug !== parentSlug)
                .map(child => ({
                    city_name: child.city_name,
                    city_slug: child.city_slug
                }));

            parentCitiesWithChildren.push({
                city_name: parentCity.city_name,
                city_slug: parentCity.city_slug,
                childCities
            });
        }
    }

    return { parentCities: parentCitiesWithChildren };
});