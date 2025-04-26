import { createError } from "h3";
import type { Database } from "~~/types/database.types";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
    // const user = await serverSupabaseUser(event);
    const client = await serverSupabaseClient<Database>(event);
    const body = await readBody(event);
    let query = client.from("cafes").select("name,city, photo, city, slug_name, description, city_slug,rating, range, rating_num, cafe_features(cafe_id, feature_id)", { count: "exact" });

    if (body.features && body.features.length > 0) {
        const { data: feature_id, error: error1 } = await client.from("features")
            .select('id')
            .in('feature_slug', body.features)

        // Create an array of feature IDs
        const featureIds = feature_id?.map(feature => feature.id) || [];

        const { data: cafes_ids, error: error2 } = await client.from("cafe_features")
            .select('cafe_id')
            .in('feature_id', featureIds)

        const cafesIds = cafes_ids?.map(feature => feature.cafe_id) || [];

        if (featureIds.length > 0) {
            // Filter cafes that have any of these features
            query = query.in('id', cafesIds);
        }
    }

    if (body.city && body.city.length > 0) {
        query.in('city_slug', body.city)
    }

    if (body.ratings && body.ratings.length > 0) {
        const ratingFilters = body.ratings.map((rating: number) =>
            `and(rating_num.gte.${rating},rating_num.lt.${rating + 1})`
        ).join(',');
        query = query.or(ratingFilters);
    }

    if (body.ranges && body.ranges.length > 0) {
        const rangeArray = body.ranges.map((range: number) => `"${range}"`);
        query.in('range', body.ranges)
    }

    query = query.ilike("name", `%${body.searchQuery}%`);
    // query = query.lt('st_distance(location, st_point(107.59655891385863, -6.879245721118651)::geography)', 5000)
    // query = query.filter(
    //     'ST_Distance(location::geometry, ST_MakePoint(107.59655891385863, -6.879245721118651)::geometry)',
    //     'gt',
    //     5000
    // )
    // query = query.filter(
    //     `ST_Distance(location::geography, ST_MakePoint(107.59655891385863, -6.879245721118651)::geography) > 5000`
    // );
    // query = query.gt('id', 5000)
    query = query.order('id', { ascending: false })

    query = query.range(body.from, body.to)

    if (body.cariLocation) {
        // Calculating the Shift:
        // Latitude: To shift 5 km north, you would add approximately 0.0449 degrees to the current latitude. To shift south, you would subtract 0.0449 degrees. 
        // Longitude: To shift 5 km east, you would add approximately 0.0449/cos(latitude) degrees to the current longitude. To shift west, you would subtract 0.0449/cos(latitude) degrees. 
        // body.latitude -6.874430493406096
        // body.longtitude 107.4717864955787
        let latitude = body.latitude
        let latitudeS = body.latitude
        let latitudeB = body.latitude

        let longitude = body.longitude
        let longitudeS = body.longitude
        let longitudeB = body.longitude

        latitudeS = body.latitude + (5 / 111)
        latitudeB = body.latitude - (5 / 111)
        longitudeS = longitude - (5 / (111 * Math.cos(latitude)))
        longitudeB = longitude + (5 / (111 * Math.cos(latitude)))


        query = query.not('latitude', 'is', null)
        query = query.not('longitude', 'is', null)
        query = query.gt('lat', latitudeB)
        query = query.lt('lat', latitudeS)
        query = query.gt('long', longitudeS)
        query = query.lt('long', longitudeB)
        // query = query.rangeGte('lat', '[latitudeB, latitudeS]')
        // query = query.range('long', longitudeS, longitudeB)
    }
    // console.log(query)

    const { data, error, count } = await query
    if (error) throw createError({ statusMessage: error.message });

    return { 'data': data, 'count': count };
});
