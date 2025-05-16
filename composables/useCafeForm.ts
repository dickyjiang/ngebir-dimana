// composables/useCafeForm.ts
import { ref, watch, onMounted } from 'vue';


export interface ChildCity {
  city_name: string;
  city_slug: string;
}
export interface ParentCity {
  city_name: string;
  city_slug: string;
  childCities: ChildCity[];
}

export interface FormErrors {
  cafeName: string[];
  description: string[];
  menuItems: string[];
  site: string[];
  phone: string[];
  full_address: string[];
  borough: string[];
  street: string[];
  city: string[];
  postal_code: string[];
  state: string[];
  lat: string[];
  long: string[];
  rating: string[];
  logo: string[];
  location_link: string[];
  general: string[];
}
export const formErrors = ref<FormErrors>({
  cafeName: [],
  description: [],
  menuItems: [],
  site: [],
  phone: [],
  full_address: [],
  borough: [],
  street: [],
  city: [],
  postal_code: [],
  state: [],
  lat: [],
  long: [],
  location_link: [],
  rating: [],
  logo: [],
  general: [],
});

export function useCafeForm(isEditMode: Ref<boolean>, cafeId: Ref<string | null>) {
  // All your form state and methods from your existing form

  const cafeName = ref('');
  const cafeIdInteger = ref(0);
  const businessTypes = ref<string[]>([]);

  const cafeStreet = ref('');
  const cafeSite = ref('');
  const cafeDescription = ref('');
  const phoneNumber = ref('+62 '); // Initialize with space
  const parentCities = ref<ParentCity[]>([]);
  const isSubmitting = ref(false);

  const availableChildCities = ref<ChildCity[]>([]);
  const selectedParentCity = ref('');
  const selectedChildCity = ref('');

  const locationLink = ref('');

  const selectedFeatures = ref<Feature[]>([]);

  // const logoFile = ref<File | null>(null);
  const logoFile = ref<File[]>([]); // Store the actual File objects
  const imageFiles = ref<File[]>([]); // Store the actual File objects
  const menuImageFiles = ref<File[]>([]); // Store the actual File objects

  const menuImageErrors = ref<string[]>([]); // Store validation errors

  const imageErrors = ref<string[]>([]); // Store validation errors

  const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
  const hasExistingImages = ref(false);
  const existingImageUrls = ref<string[]>([]);
  const hasExistingMenuImages = ref(false);
  const existingMenuImageUrls = ref<string[]>([]);
  const imagesToDelete = ref<number[]>([]);

  const hasExistingLogo = ref(false);
  const existingLogoUrls = ref<string[]>([]);

  const days = ref([
    {
      id: 'sunday',
      name: 'Sunday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'monday',
      name: 'Monday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'tuesday',
      name: 'Tuesday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'wednesday',
      name: 'Wednesday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'thursday',
      name: 'Thursday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'friday',
      name: 'Friday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
    {
      id: 'saturday',
      name: 'Saturday',
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
  ]);

  // const { features } = await useFetchFeatures();
  // ...other form fields

  // Helper function to convert time format from 12.30am to 00:30 format
  const convertTimeFormat = (timeStr) => {
    try {
      // Handle special case for 24h format
      if (timeStr === '24') return '23:59';

      // Trim whitespace
      timeStr = timeStr.trim();

      // Parse time like "12.30am" or "4.30pm"
      const match = timeStr.match(/(\d+)\.?(\d*)?\s*(am|pm|AM|PM)?/);
      if (!match) return '00:00';

      let [_, hours, minutes, period] = match;
      hours = parseInt(hours);

      // Handle missing minutes
      minutes = minutes ? minutes : '00';

      // Handle missing period (assume 24h format)
      period = period ? period.toLowerCase() : '';

      // Convert 12-hour to 24-hour format
      if (period === 'pm' && hours < 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }

      // Format with leading zeros
      return `${hours.toString().padStart(2, '0')}:${minutes.padEnd(2, '0')}`;
    } catch (e) {
      console.error('Error parsing time:', timeStr, e);
      return '00:00';
    }
  };

  // Corrected implementation of convertDaysToFormFormat
  // Direct fix for convertDaysToFormFormat
  // Fixed implementation of convertDaysToFormFormat to handle string input
  const convertDaysToFormFormat = (daysData) => {
    // Handle null or undefined daysData
    if (!daysData) {
      return days.value; // Return default days if no data provided
    }

    // Parse the data if it's a string
    let parsedData = daysData;
    if (typeof daysData === 'string') {
      try {
        parsedData = JSON.parse(daysData);
      } catch (e) {
        console.error('Error parsing days data string:', e);
        return days.value; // Return default on parsing error
      }
    }

    // Define the order of days
    const dayOrder = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday'
    ];

    // Create a completely new array with processed values
    return dayOrder.map(dayName => {
      const dayValue = parsedData[dayName];

      // Set defaults
      let isOpen = false;
      let openTime = '00:00';
      let closeTime = '23:59';

      // 1. Check for Closed explicitly
      if (dayValue === 'Closed') {
        isOpen = false;
      }
      // 2. Check for 24-hour formats
      else if (dayValue === '24-24' || dayValue === '24h' || dayValue === '24') {
        isOpen = true;
        openTime = '24'
        closeTime = '24'
      }
      // 3. Check for time ranges with separators
      else if (dayValue && (dayValue.includes('-') || dayValue.includes('to') || dayValue.includes('~'))) {
        const separator = dayValue.includes('-') ? '-' :
          dayValue.includes('to') ? 'to' : '~';

        const times = dayValue.split(separator);

        if (times.length === 2) {
          isOpen = true;
          openTime = convertTimeFormat(times[0]);
          closeTime = convertTimeFormat(times[1]);
        }
      }

      return {
        id: dayName.toLowerCase(),
        name: dayName,
        isOpen,
        openTime,
        closeTime
      };
    });
  };

  // Function to load cafe data when in edit mode
  const loadCafeData = async () => {
    if (isEditMode.value && cafeId.value) {
      try {
        // Fetch cafe data by ID
        const response = await fetch(`/api/cafe/${cafeId.value}`);
        const data = await response.json();

        // Populate form fields
        cafeName.value = data.data.name || '';
        cafeIdInteger.value = data.data.id || 0;
        businessTypes.value = data.businessTypes || [];
        cafeStreet.value = data.data.street || '';
        cafeSite.value = data.data.site || '';
        cafeDescription.value = data.data.description || '';
        phoneNumber.value = data.data.phone || '+62 ';
        selectedParentCity.value = data.city_parent[0].city_parent || '';
        selectedChildCity.value = data.data.city_slug || '';
        locationLink.value = data.data.location_link || '';
        if (data.data.photo) {
          hasExistingImages.value = true;
          existingImageUrls.value = [data.data.photo];
          imageFiles.value = []; // Clear imageFiles as we're not replacing them yet
        }
        if (data.data.logo) {
          hasExistingLogo.value = true;
          existingLogoUrls.value = [data.data.logo];
          logoFile.value = []
        }
        if (data.cafe_pics && data.cafe_pics.length > 0) {
          hasExistingMenuImages.value = true;
          existingMenuImageUrls.value = data.cafe_pics.map((pic: any) => pic.url);
          menuImageFiles.value = []; // Clear menuImageFiles as we're not replacing them yet
        } else {
          hasExistingMenuImages.value = false;
          existingMenuImageUrls.value = [];
        }
        days.value = convertDaysToFormFormat(data.data.working_hours) || [];
        selectedFeatures.value = data.features || [];
        // ...populate other fields
      } catch (error) {
        console.error('Error loading cafe data:', error);
      }
    }
  };

  const fetchCityData = async () => {
    try {
      const response = await fetch('/api/city/parent');
      const data = await response.json();
      parentCities.value = data.parentCities || [];
    } catch (error) {
      console.error('Error fetching city data:', error);
    }
  };


  // Add a watcher to react to changes in isEditMode or cafeId
  watch([isEditMode, cafeId], ([newIsEditMode, newCafeId]) => {
    if (newIsEditMode && newCafeId) {
      loadCafeData();
    }
  }, { immediate: true });

  // Also keep the onMounted hook as a fallback
  onMounted(() => {
    fetchCityData()
    loadCafeData();
  });

  // Validation function stub (implement your actual validation logic)
  const validateForm = () => {
    // Implement your validation logic here
    Object.keys(formErrors.value).forEach((key) => {
      formErrors.value[key] = [];
    });
    let isValid = true;

    // Reset all previous errors
    Object.keys(formErrors.value).forEach((key) => {
      formErrors.value[key as keyof FormErrors] = [];
    });

    // Validate cafe name
    if (!cafeName.value || cafeName.value.trim() === '') {
      formErrors.value.cafeName.push('Nama cafe tidak boleh kosong');
      isValid = false;
    }

    if (!selectedParentCity.value) {
      formErrors.value.state.push('Provinsi/Kota Besar tidak boleh kosong');
      isValid = false;
    }
    if (!selectedChildCity.value) {
      formErrors.value.city.push('Kota/Kabupaten tidak boleh kosong');
      isValid = false;
    }
    if (!locationLink.value) {
      formErrors.value.location_link.push('Location link tidak boleh kosong');
      isValid = false;
    }

    // Check if we have new files or existing images in edit mode
    if ((!imageFiles.value || imageFiles.value.length === 0) &&
      (!isEditMode.value || !hasExistingImages.value)) {
      imageErrors.value.push(
        'Gambar cafe tidak boleh kosong. Silakan pilih file gambar.'
      );
      isValid = false;
    } else if (imageFiles.value && imageFiles.value.length > 0) {
      // Only validate new files when they exist
      let hasImageError = false;
      imageFiles.value.forEach((file) => {
        if (!file.type.startsWith('image/')) {
          formErrors.value.logo.push(`${file.name} bukan file gambar`);
          hasImageError = true;
        }
        if (file.size > maxFileSize) {
          formErrors.value.logo.push(`${file.name} melebihi batas ukuran 5MB`);
          hasImageError = true;
        }
      });

      if (hasImageError) {
        isValid = false;
      }
    }

    return isValid;
  };

  // Form validation, submission logic, etc.
  const submitForm = async () => {

    if (!validateForm()) return;

    isSubmitting.value = true;
    const formData = new FormData();

    // Add all form data
    formData.append('cafeName', cafeName.value);
    // ... other form fields ...
    formData.append('cafeId', cafeIdInteger.value.toString());
    formData.append('cafeName', cafeName.value);
    formData.append('cafeStreet', cafeStreet.value);
    formData.append('cafeDescription', cafeDescription.value);
    formData.append('cafeSite', cafeSite.value);
    formData.append('cafePhoneNumber', phoneNumber.value);
    formData.append('cafeCity', selectedChildCity.value);
    formData.append('cafeState', selectedParentCity.value);
    formData.append('cafeLocationLink', locationLink.value);

    // if (logoFile.value) {
    //   formData.append('cafeLogo', logoFile.value);
    // }

    if (logoFile.value.length > 0) {
      formData.append('cafeLogo', logoFile.value[0]);
    }

    if (isEditMode.value && hasExistingLogo.value && logoFile.value.length === 0) {
      formData.append('keepExistingLogo', 'true');
      formData.append('existingLogoUrls', JSON.stringify(existingImageUrls.value));
    }

    // Add a flag to indicate if we're keeping existing images
    if (isEditMode.value && hasExistingImages.value && imageFiles.value.length === 0) {
      formData.append('keepExistingImages', 'true');
      formData.append('existingImageUrls', JSON.stringify(existingImageUrls.value));
    }

    if (imageFiles.value.length > 0) {
      formData.append('image', imageFiles.value[0]);
    }

    if (isEditMode.value && hasExistingMenuImages.value && menuImageFiles.value.length === 0) {
      formData.append('keepExistingMenuImages', 'true');
      formData.append('existingMenuImageUrls', JSON.stringify(existingMenuImageUrls.value));
    }

    if (menuImageFiles.value.length > 0) {
      for (let i = 0; i < menuImageFiles.value.length; i++) {
        formData.append('images', menuImageFiles.value[i]);
      }
    }

    formData.append('features', JSON.stringify(selectedFeatures.value));
    formData.append('cafeWorkingHours', JSON.stringify(days.value));
    // In the submitForm function, add after the other formData.append calls
    if (imagesToDelete.value.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete.value));
    }

    try {
      const url = isEditMode.value
        ? `/api/cafe/owner/${cafeId.value}`
        : '/api/cafe/owner';

      const method = isEditMode.value ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        // Get response text if available
        let errorMessage = 'Network response was not ok';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If can't parse JSON, try to get text
          try {
            errorMessage = await response.text() || errorMessage;
          } catch (e2) {
            // Fallback to status text if all else fails
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      // Redirect to list page after success
      navigateTo('/profile');
      return true; // Return success status
    } catch (error) {
      console.error('Error submitting form:', error);
      // Important: Rethrow the error so it can be caught by the component
      isSubmitting.value = false;
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    // Return all the form state and methods
    cafeName,
    businessTypes,

    cafeStreet,
    cafeSite,
    cafeDescription,
    phoneNumber,
    parentCities,
    isSubmitting,
    validateForm,
    submitForm,
    loadCafeData,

    selectedParentCity,
    selectedChildCity,
    availableChildCities,
    locationLink,
    selectedFeatures,
    days,
    logoFile,
    imageFiles,
    menuImageFiles,
    formErrors,
    menuImageErrors,
    imageErrors,
    hasExistingImages,
    existingImageUrls,
    cafeIdInteger,
    hasExistingMenuImages,
    existingMenuImageUrls,
    imagesToDelete,
    hasExistingLogo,
    existingLogoUrls

  };
}