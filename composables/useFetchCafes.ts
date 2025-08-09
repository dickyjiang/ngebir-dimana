import { ref } from 'vue'

export function useFetchCafes() {
  const data = ref([])
  const loading = ref(true)
  const totalCafes = ref(0)

  /**
   * Fetches cafe data with pagination and filtering
   * @param page Current page number
   * @param itemsPerPage Number of items per page
   * @param filters Filter options (city, features, etc.)
   * @param searchQuery Search query string or object
   * @param isNearbyActive Whether nearby location filter is active
   * @param userLocation User's location coordinates
   */
  async function fetchCafes(
    page: number,
    itemsPerPage: number,
    filters = null,
    searchQuery = '',
    isNearbyActive = false,
    userLocation = null
  ) {
    loading.value = true

    // Calculate pagination range
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    try {
      let payload: any = {
        from,
        to,
        requestedItems: itemsPerPage,
        page,
      }

      // Add filter data
      if (filters) {
        payload = {
          ...payload,
          city: filters.city || [],
          features: filters.features || [],
          filterTypes: 'all', // Default filter type
        }
      }

      // Add search query
      if (searchQuery) {
        if (typeof searchQuery === 'object') {
          payload.searchQuery = searchQuery.query || ''
          payload.filterTypes = searchQuery.filter || 'all'
        } else {
          payload.searchQuery = searchQuery || ''
        }
      }

      // 🎯 Add location data if nearby filtering is active
      if (isNearbyActive && userLocation && userLocation.latitude && userLocation.longitude) {
        payload.cariLocation = true
        payload.latitude = userLocation.latitude
        payload.longitude = userLocation.longitude
        
        console.log('✅ Location filtering enabled:', {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusKm: 5
        })
      } else {
        console.log('❌ Location filtering disabled:', {
          isNearbyActive,
          hasUserLocation: !!userLocation,
          userLocationDetails: userLocation
        })
      }

      console.log('📤 API Payload:', payload)

      const hasil = await $fetch('/api/search', {
        method: 'POST',
        body: payload,
        headers: useRequestHeaders(['cookie']),
      })

      console.log('📥 API Response:', {
        count: hasil.count,
        dataLength: hasil.data?.length,
        hasLocationFilter: !!payload.cariLocation
      })

      totalCafes.value = hasil.count || 0
      data.value = hasil.data || []

    } catch (err) {
      console.error('🚨 Fetch Error:', err)
      data.value = []
      totalCafes.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    totalCafes,
    fetchCafes,
  }
}