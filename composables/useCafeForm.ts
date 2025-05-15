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
});

export function useCafeForm(isEditMode: Ref<boolean>, cafeId: Ref<string | null>) {
  // All your form state and methods from your existing form

  const cafeName = ref('');
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

  const logoFile = ref<File | null>(null);
  const imageFiles = ref<File[]>([]); // Store the actual File objects
  const menuImageFiles = ref<File[]>([]); // Store the actual File objects

  const menuImageErrors = ref<string[]>([]); // Store validation errors

  const imageErrors = ref<string[]>([]); // Store validation errors

  const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

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
        businessTypes.value = data.businessTypes || [];
        cafeStreet.value = data.data.street || '';
        cafeSite.value = data.data.site || '';
        cafeDescription.value = data.data.description || '';
        phoneNumber.value = data.data.phone || '+62 ';
        selectedParentCity.value = data.city_parent[0].city_parent || '';
        selectedChildCity.value = data.data.city_slug || '';
        locationLink.value = data.data.location_link || '';
        imageFiles.value = data.data.photo || '';
        logoFile.value = data.data.logo || null;
        menuImageFiles.value = data.cafe_pics.map((pic: any) => pic.url) || [];
        days.value = convertDaysToFormFormat(data.data.working_hours) || [];
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

    if (!imageFiles.value || imageFiles.value.length === 0) {
      imageErrors.value.push(
        'Gambar cafe tidak boleh kosong. Silakan pilih file gambar.'
      );
      isValid = false;
    } else {
      // Check each file for type and size
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

    // formData.append('parentCity', selectedParentCity.value);
    // formData.append('childCity', selectedChildCity.value);
    // ... other form fields ...


    formData.append('cafeName', cafeName.value);
    formData.append('cafeStreet', cafeStreet.value);
    formData.append('cafeDescription', cafeDescription.value);
    formData.append('cafeSite', cafeSite.value);
    formData.append('cafePhoneNumber', phoneNumber.value);
    formData.append('cafeCity', selectedChildCity.value);
    formData.append('cafeState', selectedParentCity.value);
    formData.append('cafeLocationLink', locationLink.value);
    // features: selectedFeatures.value.map(feature => feature.id),

    if (logoFile.value) {
      formData.append('cafeLogo', logoFile.value);
    }

    if (imageFiles.value.length > 0) {
      formData.append('image', imageFiles.value[0]);
    }

    if (menuImageFiles.value.length > 0) {
      for (let i = 0; i < menuImageFiles.value.length; i++) {
        formData.append('images', menuImageFiles.value[i]);
      }
    }

    formData.append('features', JSON.stringify(selectedFeatures.value));
    formData.append('cafeWorkingHours', JSON.stringify(days.value));

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
        throw new Error('Network response was not ok');
      }

      // Redirect to list page after success
      navigateTo('/profile');
    } catch (error) {
      console.error('Error submitting form:', error);
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
    imageErrors

  };
}