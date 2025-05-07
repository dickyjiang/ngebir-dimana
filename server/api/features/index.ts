import { createError } from "h3";
import type { Database } from "~~/types/database.types";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);

    // Just one query to get all cities
    const { data: allCities, error } = await client
        .from("features")
        .select()
        .order("name", { ascending: true });

    if (error) throw createError({ statusMessage: error.message });



    // Return both datasets
    return allCities;
});