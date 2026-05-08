import { ref, computed, onMounted } from 'vue'

export function useNearbyFilter() {
  // State for user location and nearby filter
  const userLocation = ref(null)
  const locationLoading = ref(false)
  const locationError = ref(null)
  const isNearbyActive = ref(false)
  const showLocationModal = ref(false)
  const manualLatitude = ref(null)
  const manualLongitude = ref(null)

  // Toast notification state
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref('error') // 'error' or 'success'

  // Location permission modal state
  const showLocationPermissionModal = ref(false)
  const hasSeenLocationModal = ref(false)

  // Initialize localStorage check - need to check hasSeenLocationModal synchronously
  // but load userLocation asynchronously to avoid SSR issues
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const hasSeenBefore = localStorage.getItem('hasSeenLocationModal')
    hasSeenLocationModal.value = hasSeenBefore === 'true'
  }

  // Load saved location and nearby state on client side only
  onMounted(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Load saved location from localStorage
      const savedLocation = localStorage.getItem('userLocation')
      if (savedLocation) {
        try {
          userLocation.value = JSON.parse(savedLocation)
          console.log('📍 Loaded saved location from localStorage:', userLocation.value)
        } catch (error) {
          console.error('Error parsing saved location:', error)
          localStorage.removeItem('userLocation')
        }
      }

      // Load saved nearby filter state
      const savedNearbyActive = localStorage.getItem('isNearbyActive')
      if (savedNearbyActive === 'true' && userLocation.value) {
        isNearbyActive.value = true
        console.log('🎯 Restored nearby filter state: active')
      }
      
      console.log('🔍 Location state loaded:', {
        hasSeenLocationModal: hasSeenLocationModal.value,
        savedLocation: userLocation.value,
        isNearbyActive: isNearbyActive.value
      })
    }
  })

  // Computed property to validate coordinates
  const isValidCoordinates = computed(() => {
    const lat = parseFloat(manualLatitude.value)
    const lng = parseFloat(manualLongitude.value)
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  })

  // Show toast notification
  function showToastNotification(message: string, type: 'success' | 'error' = 'error', duration: number = 3000) {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, duration)
  }

  // Save nearby filter state to localStorage
  function saveNearbyState() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('isNearbyActive', isNearbyActive.value.toString())
      console.log('💾 Nearby filter state saved:', isNearbyActive.value)
    }
  }

  // Get user's current location using browser geolocation
  async function getUserLocation() {
    if (userLocation.value) {
      console.log('📍 Using cached location:', userLocation.value)
      return userLocation.value
    }

    locationLoading.value = true
    locationError.value = null

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }

      // Check if site is secure (required for geolocation)
      if (!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Geolocation requires HTTPS')
      }

      console.log('🌍 Requesting browser geolocation...')
      
      const position = await new Promise((resolve, reject) => {
        const options = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('✅ Geolocation success:', position.coords)
            resolve(position)
          },
          (error) => {
            console.error('❌ Geolocation error:', {
              code: error.code,
              message: error.message
            })
            reject(error)
          },
          options
        )
      })

      userLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      // Save location to localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('userLocation', JSON.stringify(userLocation.value))
        console.log('💾 Location saved to localStorage')
      }

      console.log('📍 User location set:', userLocation.value)
      return userLocation.value

    } catch (error) {
      console.error('🚨 Location error:', error)
      
      let errorMessage = 'Tidak dapat mengakses lokasi Anda.'
      
      if (error.code === 1) {
        errorMessage = 'Akses lokasi ditolak. Silakan aktifkan layanan lokasi di pengaturan browser Anda.'
      } else if (error.code === 2) {
        errorMessage = 'Tidak dapat menentukan lokasi Anda. Silakan periksa pengaturan perangkat dan coba lagi.'
      } else if (error.code === 3) {
        errorMessage = 'Permintaan lokasi habis waktu. Silakan coba lagi.'
      }

      locationError.value = errorMessage
      showToastNotification(errorMessage, 'error', 5000)
      
      // Show manual location modal as fallback
      setTimeout(() => {
        showLocationModal.value = true
      }, 1000)

      throw error
    } finally {
      locationLoading.value = false
    }
  }

  // Set location manually
  async function setManualLocation(fetchCafesCallback = null, activeFilters = null) {
    if (!isValidCoordinates.value) {
      showToastNotification('Silakan masukkan koordinat yang valid.', 'error')
      return
    }

    userLocation.value = {
      latitude: parseFloat(manualLatitude.value),
      longitude: parseFloat(manualLongitude.value),
    }

    // Save location to localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('userLocation', JSON.stringify(userLocation.value))
      console.log('💾 Manual location saved to localStorage')
    }

    console.log('📍 Manual location set:', userLocation.value)
    
    showLocationModal.value = false
    isNearbyActive.value = true
    saveNearbyState()

    showToastNotification('Lokasi diatur! Mencari bar terdekat...', 'success')

    // Trigger cafe fetching if callback provided
    if (fetchCafesCallback && activeFilters) {
      console.log('🔄 Triggering cafe fetch with manual location...')
      await fetchCafesCallback(1, activeFilters)
    }

    return userLocation.value
  }

  // Show location permission modal on first visit
  function showLocationPermissionPrompt() {
    console.log('🔍 Checking if should show location prompt:', {
      hasSeenLocationModal: hasSeenLocationModal.value,
      hasUserLocation: !!userLocation.value
    })

    // Only show modal if user hasn't seen it before
    if (!hasSeenLocationModal.value) {
      console.log('📱 Showing location permission modal')
      showLocationPermissionModal.value = true
    }
  }

  // Handle location permission response
  async function handleLocationPermissionResponse(granted: boolean, fetchCafesCallback = null, activeFilters = null) {
    console.log('🎯 Location permission response:', { granted })
    
    showLocationPermissionModal.value = false
    hasSeenLocationModal.value = true
    
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('hasSeenLocationModal', 'true')
    }

    if (granted) {
      try {
        await getUserLocation()
        if (userLocation.value) {
          isNearbyActive.value = true
          saveNearbyState()
          
          // Trigger cafe fetching if callback provided
          if (fetchCafesCallback && activeFilters) {
            console.log('🔄 Fetching nearby cafes after permission granted...')
            await fetchCafesCallback(1, activeFilters)
          }
          
          showToastNotification('Akses lokasi diizinkan! Mencari bar terdekat...', 'success')
        }
      } catch (error) {
        console.error('Location error after permission granted:', error)
        // Show manual location as fallback
        showLocationModal.value = true
      }
    } else {
      // User declined, show manual location option
      showLocationModal.value = true
    }
  }

  // Toggle nearby filter (main function called by "cafe terdekat" button)
  async function toggleNearbyFilter(fetchCafesCallback, activeFilters) {
    console.log('🎯 Toggle nearby filter:', {
      currentlyActive: isNearbyActive.value,
      hasLocation: !!userLocation.value
    })

    try {
      if (isNearbyActive.value) {
        // If already active, deactivate it
        isNearbyActive.value = false
        saveNearbyState()
        console.log('❌ Nearby filter deactivated')
        
        // Fetch all cafes without location filter
        await fetchCafesCallback(1, activeFilters)
        return
      }

      // If we have location, activate nearby filter
      if (userLocation.value) {
        isNearbyActive.value = true
        saveNearbyState()
        console.log('✅ Nearby filter activated with existing location')
        await fetchCafesCallback(1, activeFilters)
        return
      }

      // No location - show permission modal or try to get location
      if (!hasSeenLocationModal.value) {
        console.log('📱 Showing location permission modal for first time')
        showLocationPermissionModal.value = true
      } else {
        console.log('🌍 Attempting to get location directly')
        showToastNotification('Mengakses lokasi Anda...', 'success')
        
        try {
          await getUserLocation()
          if (userLocation.value) {
            isNearbyActive.value = true
            saveNearbyState()
            await fetchCafesCallback(1, activeFilters)
          }
        } catch (error) {
          // Show manual location as fallback
          showLocationModal.value = true
        }
      }

    } catch (error) {
      console.error('🚨 Error in toggleNearbyFilter:', error)
      isNearbyActive.value = false
      saveNearbyState()
      showToastNotification('Terjadi kesalahan. Silakan coba lagi.', 'error')
    }
  }

  // Calculate distance between two points (Haversine formula)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
  }

  // Reset location state (for testing/debugging)
  function resetLocationState() {
    userLocation.value = null
    isNearbyActive.value = false
    hasSeenLocationModal.value = false
    showLocationPermissionModal.value = false
    showLocationModal.value = false
    locationError.value = null
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('hasSeenLocationModal')
      localStorage.removeItem('userLocation')
      localStorage.removeItem('isNearbyActive')
    }
    console.log('🔄 Location state reset')
  }

  return {
    // State
    userLocation,
    locationLoading,
    locationError,
    isNearbyActive,
    showLocationModal,
    manualLatitude,
    manualLongitude,
    showToast,
    toastMessage,
    toastType,
    showLocationPermissionModal,
    hasSeenLocationModal,
    
    // Computed
    isValidCoordinates,
    
    // Methods
    getUserLocation,
    setManualLocation,
    showLocationPermissionPrompt,
    handleLocationPermissionResponse,
    toggleNearbyFilter,
    calculateDistance,
    resetLocationState,
    showToastNotification,
  }
}