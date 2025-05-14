import { createError } from "h3";
import type { Database } from "~~/types/database.types";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);

    // Get parent values first, deduplicate them, then query
    const { data: parentData } = await client.from('city')
        .select('city_parent')
        .not('city_parent', 'is', null);

    // Extract and deduplicate parent values
    const uniqueParents = [...new Set(parentData?.map(item => item.city_parent).filter(Boolean))];

    if (uniqueParents.length > 0) {
        // Get the parent cities
        const { data: parentCities, error: sqlError } = await client.from('city')
            .select('city_name, city_slug')
            .in('city_slug', uniqueParents);

        if (sqlError) throw createError({ statusMessage: sqlError.message });

        // Get all child cities
        const { data: allChildCities, error: childError } = await client.from('city')
            .select('city_name, city_slug, city_parent')
            .not('city_parent', 'is', null);

        if (childError) throw createError({ statusMessage: childError.message });

        // Organize child cities by parent
        const parentCitiesWithChildren = parentCities.map(parent => {
            const childCities = allChildCities.filter(child =>
                child.city_parent === parent.city_slug
            );

            return {
                ...parent,
                childCities: childCities.map(child => ({
                    city_name: child.city_name,
                    city_slug: child.city_slug
                }))
            };
        });

        return { parentCities: parentCitiesWithChildren };
    }

    return { parentCities: [] };
});