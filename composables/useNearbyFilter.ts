import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

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

  // New state for location permission modal
  const showLocationPermissionModal = ref(false)
  const hasSeenLocationModal = ref(false)

  // Check if user has seen the modal before (using localStorage)
  if (process.client) {
    hasSeenLocationModal.value = localStorage.getItem('hasSeenLocationModal') === 'true'
  }

  // Computed property to validate coordinates
  const isValidCoordinates = computed(() => {
    const lat = parseFloat(manualLatitude.value)
    const lng = parseFloat(manualLongitude.value)

    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  })

  // Function to get user's current location
  async function getUserLocation() {
    if (userLocation.value) {
      // If we already have the location, just use it
      return userLocation.value
    }

    locationLoading.value = true
    locationError.value = null

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        locationError.value = 'Geolocation is not supported by your browser'
        throw new Error('Geolocation not supported')
      }

      // Get current position with a shorter timeout
      const position = await new Promise((resolve, reject) => {
        // iOS Safari needs secure context (HTTPS) to use geolocation
        // Also, iOS requires explicit user interaction for geolocation permissions
        const geoOptions = {
          enableHighAccuracy: true, // Set to true for iOS
          timeout: 15000, // Increased timeout for iOS (15 seconds)
          maximumAge: 0, // Don't use cached position on iOS
        }

        const handleSuccess = (position) => {
          resolve(position)
        }

        const handleError = (error) => {
          reject(error)
        }

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions)
      })

      userLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      return userLocation.value
    } catch (error) {
      // More user-friendly error message for common geolocation errors
      if (error.code === 1) {
        locationError.value =
          'Location access was denied. Please enable location services for this website in your browser settings.'
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE - More detailed guidance
        locationError.value =
          "Unable to determine your location. Please check that:\n\n1. Your device's location is turned on\n2. You're using a secure connection (HTTPS)\n3. You're not in private/incognito mode\n4. You've granted location permissions"

        // Show the manual location input modal
        showLocationModal.value = true
      } else if (error.code === 3) {
        locationError.value =
          'Location request timed out. Please try again with a better connection.'
      } else {
        locationError.value = error.message || 'Unable to get your location'
      }

      throw error
    } finally {
      locationLoading.value = false
    }
  }

  // Function to set location manually
  async function setManualLocation() {
    if (!isValidCoordinates.value) return

    userLocation.value = {
      latitude: parseFloat(manualLatitude.value),
      longitude: parseFloat(manualLongitude.value),
    }

    showLocationModal.value = false

    // Continue with nearby filter
    isNearbyActive.value = true

    // Show success message
    toastMessage.value = 'Location set manually. Finding nearby cafes...'
    toastType.value = 'success'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)

    return userLocation.value
  }

  // Function to show location permission modal
  function showLocationPermissionPrompt() {
    if (!hasSeenLocationModal.value) {
      showLocationPermissionModal.value = true
    }
  }

  // Function to handle location permission response
  async function handleLocationPermissionResponse(granted, fetchCafes = null) {
    showLocationPermissionModal.value = false

    // Mark as seen
    hasSeenLocationModal.value = true
    if (process.client) {
      localStorage.setItem('hasSeenLocationModal', 'true')
    }

    if (granted) {
      // User agreed to share location, now request it
      try {
        await getUserLocation()
        if (userLocation.value) {
          isNearbyActive.value = true
          // Trigger cafe fetching if callback provided
          if (fetchCafes) {
            await fetchCafes(1, { city: [], borough: [], features: [] })
          }
          toastMessage.value = 'Location access granted! Finding nearby cafes...'
          toastType.value = 'success'
          showToast.value = true
          setTimeout(() => {
            showToast.value = false
          }, 3000)
        }
      } catch (error) {
        // Handle location error
        console.error('Location error:', error)
        // Show manual location modal as fallback
        showLocationModal.value = true
      }
    } else {
      // User declined, show manual location option
      showLocationModal.value = true
    }
  }

  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  // Main function to toggle nearby filter
  async function toggleNearbyFilter(activeFilters, fetchCafes) {
    try {
      if (isNearbyActive.value) {
        // If already active, deactivate it
        isNearbyActive.value = false
        // Clear any city filters that might have been set
        activeFilters.city = []
        activeFilters.borough = []
        // Fetch all cafes
        fetchCafes(1, activeFilters)
        return
      }

      // Before requesting location, show instructions toast for better UX
      toastMessage.value = 'Requesting your location... Please allow access when prompted.'
      toastType.value = 'success'
      showToast.value = true

      // Hide after 3 seconds
      setTimeout(() => {
        showToast.value = false
      }, 3000)

      // Get user location
      try {
        await getUserLocation()
      } catch (error) {
        // Don't show error toast if we're showing the manual location modal instead
        if (!showLocationModal.value) {
          // Show a toast notification for location errors
          toastMessage.value = locationError.value || 'Unable to get your location'
          toastType.value = 'error'
          showToast.value = true

          // Hide toast after 8 seconds (longer for detailed error messages)
          setTimeout(() => {
            showToast.value = false
          }, 8000)
        }

        // Only exit if we're not showing the manual location modal
        if (!showLocationModal.value) {
          return // Exit the function if location can't be obtained and not showing manual modal
        }
      }

      if (!userLocation.value && !showLocationModal.value) {
        toastMessage.value = 'Unable to get your location. Do you want to enter it manually?'
        toastType.value = 'error'
        showToast.value = true

        setTimeout(() => {
          showToast.value = false
          // Show manual location modal as a fallback
          showLocationModal.value = true
        }, 3000)

        return
      }

      // If we have a location (auto or manual) and we're not showing the modal
      if (userLocation.value && !showLocationModal.value) {
        isNearbyActive.value = true

        await fetchCafes(1, activeFilters)
      }
    } catch (error) {
      isNearbyActive.value = false

      toastMessage.value = 'An error occurred. Please try again.'
      toastType.value = 'error'
      showToast.value = true

      setTimeout(() => {
        showToast.value = false
      }, 5000)
    }
  }

  return {
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
    isValidCoordinates,
    getUserLocation,
    setManualLocation,
    calculateDistance,
    toggleNearbyFilter,
    showLocationPermissionPrompt,
    handleLocationPermissionResponse,
    showLocationPermissionModal,
    hasSeenLocationModal,
  }
}
