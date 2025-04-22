import { createError } from "h3";
import type { Database } from "~~/types/database.types";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
    // const user = await serverSupabaseUser(event);
    const client = await serverSupabaseClient<Database>(event);
    const body = await readBody(event);
    let query = client.from("cafes").select("name,city, city_slug,rating, range, rating_num", { count: "exact" });

    if (body.city && body.city.length > 0) {
        query.in('city_slug', body.city)
    }

    if (body.ratings && body.ratings.length > 0) {
        const ratingFilters = body.ratings.map(rating =>
            `and(rating_num.gte.${rating},rating_num.lt.${rating + 1})`
        ).join(',');
        query = query.or(ratingFilters);
    }

    if (body.ranges && body.ranges.length > 0) {
        const rangeArray = body.ranges.map(range => `"${range}"`);
        query.in('range', body.ranges)
    }

    query = query.ilike("name", `%${body.searchQuery}%`);

    query.range(body.from, body.to)
    // console.log('query', query)

    const { data, error, count } = await query
    if (error) throw createError({ statusMessage: error.message });

    return { 'data': data, 'count': count };
});
