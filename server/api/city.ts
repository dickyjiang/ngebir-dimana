import { createError } from "h3";
import type { Database } from "~~/types/database.types";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
    // const user = await serverSupabaseUser(event);
    const client = await serverSupabaseClient<Database>(event);


    const { data: species_letter, error: error1 } = await client
        .from("v_city")
        .select()
        .neq("city", "")
        .order("city", { ascending: true })
    if (error1) throw createError({ statusMessage: error1.message });

    return species_letter;
});
