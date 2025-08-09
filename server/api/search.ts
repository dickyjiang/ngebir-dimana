import { createError } from 'h3'
import type { Database } from '~~/types/database.types'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const body = await readBody(event)
  
  console.log('📥 API Request Body:', {
    hasLocationFilter: !!body.cariLocation,
    latitude: body.latitude,
    longitude: body.longitude,
    filters: {
      city: body.city?.length || 0,
      features: body.features?.length || 0,
      searchQuery: body.searchQuery || 'none'
    }
  })

  // 🔍 Build base query with ALL required fields including location
  let query = client
    .from('cafes')
    .select(
      'id, name, city, photo, slug_name, description, city_slug, rating, range, rating_num, site, latitude, longitude, cafe_features(cafe_id, feature_id)',
      { count: 'exact' }
    )

  // Feature filtering
  if (body.features && body.features.length > 0) {
    const { data: feature_id, error: error1 } = await client
      .from('features')
      .select('id')
      .in('feature_slug', body.features)

    const featureIds = feature_id?.map((feature) => feature.id) || []

    if (featureIds.length > 0) {
      const { data: cafe_features, error: cfError } = await client
        .from('cafe_features')
        .select('cafe_id, feature_id')
        .in('feature_id', featureIds)

      if (cafe_features) {
        const cafesWithFeatureCounts = cafe_features.reduce<Record<number, number>>(
          (acc, record) => {
            acc[record.cafe_id] = (acc[record.cafe_id] || 0) + 1
            return acc
          },
          {}
        )

        const cafeIdsWithAllFeatures = Object.entries(cafesWithFeatureCounts)
          .filter(([cafeId, count]) => count >= featureIds.length)
          .map(([cafeId]) => Number(cafeId))

        if (cafeIdsWithAllFeatures.length > 0) {
          query = query.in('id', cafeIdsWithAllFeatures)
        } else {
          query = query.eq('id', -1) // No results
        }
      }
    }
  }

  // City filtering
  if (body.city && body.city.length > 0) {
    query = query.in('city_slug', body.city)
  }

  // Search query filtering
  if (body.searchQuery) {
    query = query.ilike('name', `%${body.searchQuery}%`)
  }

  // Filter types
  if (body.filterTypes && body.filterTypes !== 'all') {
    query = query.contains('business_type', [body.filterTypes])
  }

  // Base filters
  query = query.eq('is_published', true)
  query = query.order('id', { ascending: false })

  // 🎯 LOCATION FILTERING - 5KM RADIUS
  if (body.cariLocation && body.latitude && body.longitude) {
    console.log('🎯 Applying location filter with 5km radius')
    
    const lat = parseFloat(body.latitude)
    const lng = parseFloat(body.longitude)
    
    // Calculate 5km bounds (approximately 0.045 degrees = 5km)
    const latitudeNorth = lat + (5 / 111)  // 5km north
    const latitudeSouth = lat - (5 / 111)  // 5km south
    const longitudeEast = lng + (5 / (111 * Math.cos(lat * Math.PI / 180))) // 5km east
    const longitudeWest = lng - (5 / (111 * Math.cos(lat * Math.PI / 180))) // 5km west

    console.log('🗺️ Location bounds:', {
      userLat: lat,
      userLng: lng,
      bounds: {
        north: latitudeNorth,
        south: latitudeSouth,
        east: longitudeEast,
        west: longitudeWest
      }
    })

    // Apply location filters - FIXED column names
    query = query.not('latitude', 'is', null)
    query = query.not('longitude', 'is', null)
    query = query.gte('latitude', latitudeSouth.toString())
    query = query.lte('latitude', latitudeNorth.toString())
    query = query.gte('longitude', longitudeWest.toString())
    query = query.lte('longitude', longitudeEast.toString())

    // Debug: Count total cafes with location data
    const { count: totalWithLocation } = await client
      .from('cafes')
      .select('*', { count: 'exact', head: true })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .eq('is_published', true)

    console.log('📍 Database stats:', {
      totalCafesWithLocation: totalWithLocation,
      searchRadius: '5km'
    })
  }

  // Apply pagination
  query = query.range(body.from, body.to)

  // Execute query
  const { data, error, count } = await query
  
  if (error) {
    console.error('🚨 Database Error:', error)
    throw createError({ statusMessage: error.message })
  }

  console.log('📊 Query Results:', {
    totalCount: count,
    returnedItems: data?.length || 0,
    hasLocationFilter: !!body.cariLocation,
    sampleCafe: data?.[0] ? {
      name: data[0].name,
      city: data[0].city,
      hasCoordinates: !!(data[0].latitude && data[0].longitude)
    } : null
  })

  return { data: data, count: count }
})