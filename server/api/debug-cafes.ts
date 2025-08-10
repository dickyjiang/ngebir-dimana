import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  
  // Get basic stats
  const { count: totalCafes } = await client
    .from('cafes')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: cafesWithLocation } = await client
    .from('cafes')
    .select('*', { count: 'exact', head: true })
    .not('lat', 'is', null)
    .not('long', 'is', null)
    .eq('is_published', true)

  // Get sample data
  const { data: sampleCafes } = await client
    .from('cafes')
    .select('id, name, city, lat, long')
    .eq('is_published', true)
    .limit(10)

  // Get cafes with location data
  const { data: cafesWithCoords } = await client
    .from('cafes')
    .select('id, name, city, lat, long')
    .not('lat', 'is', null)
    .not('long', 'is', null)
    .eq('is_published', true)
    .limit(5)

  return {
    stats: {
      totalPublishedCafes: totalCafes,
      cafesWithLocationData: cafesWithLocation,
      percentageWithLocation: cafesWithLocation ? Math.round((cafesWithLocation / totalCafes) * 100) : 0
    },
    sampleCafes: sampleCafes?.map(cafe => ({
      id: cafe.id,
      name: cafe.name,
      city: cafe.city,
      hasLat: cafe.lat !== null,
      hasLong: cafe.long !== null,
      lat: cafe.lat,
      long: cafe.long,
      latType: typeof cafe.lat,
      longType: typeof cafe.long
    })),
    cafesWithCoordinates: cafesWithCoords?.map(cafe => ({
      id: cafe.id,
      name: cafe.name,
      city: cafe.city,
      coordinates: `${cafe.lat}, ${cafe.long}`
    }))
  }
})