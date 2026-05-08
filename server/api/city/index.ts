
import { createError } from "h3";
import type { Database } from "~~/types/database.types";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);

    // Just one query to get all cities
    const { data: allCities, error } = await client
        .from("city")
        .select()
        .order("city_name", { ascending: true });

    if (error) throw createError({ statusMessage: error.message });

    // Use JavaScript to separate parent and child cities
    const parentCities = allCities?.filter(city => city.city_parent == null) || [];
    const childCities = allCities?.filter(city => city.city_parent != null) || [];

    // Sort child cities by city_parent, then by city_name
    childCities.sort((a, b) => {
        if (a.city_parent !== b.city_parent) {
            return a.city_parent.localeCompare(b.city_parent);
        }
        return a.city_name.localeCompare(b.city_name);
    });


    // Return both datasets
    return {
        cities: [...parentCities, ...childCities],

        parentCities,
        childCities
    };
});