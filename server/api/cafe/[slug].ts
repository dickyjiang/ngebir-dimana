import type { Database } from "~~/types/database.types";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
    const { slug } = event.context.params;
    const client = await serverSupabaseClient<Database>(event);
    let query = client.from("cafes").select("id,name,city, photo, city, slug_name, description, city_slug,rating, range, rating_num, logo, lat, long, working_hours, location_link, site,cafe_features(cafe_id, feature_id)", { count: "exact" });
    query = query.eq('slug_name', slug)
    query = query.single();

    const { data, error, count } = await query
    if (error) throw createError({ statusMessage: error.message });

    const featureIds = [];

    // Check if data[0] exists
    if (data) {
        // Loop through cafe_features to collect feature_ids
        if (Array.isArray(data.cafe_features)) {
            for (const feature of data.cafe_features) {
                featureIds.push(feature.feature_id);
            }
        }
    }

    let query2 = client.from("features").select("id, name, feature_slug")
    query2 = query2.in('id', featureIds)

    const { data: data2, error: error2, count: count2 } = await query2
    if (error2) throw createError({ statusMessage: error2.message });

    return { 'data': data, 'count': count, 'features': data2 };
})