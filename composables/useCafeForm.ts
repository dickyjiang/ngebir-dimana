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
    loadCafeData();
    fetchCityData()
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

    const parentCityName = parentCities.value.find(
      (p) => p.city_slug === selectedParentCity.value
    )?.city_name;
    const childCityName = availableChildCities.value.find(
      (c) => c.city_slug === selectedChildCity.value
    )?.city_name;

    formData.append('cafeName', cafeName.value);
    formData.append('cafeStreet', cafeStreet.value);
    formData.append('cafeDescription', cafeDescription.value);
    formData.append('cafeSite', cafeSite.value);
    formData.append('cafePhoneNumber', phoneNumber.value);
    formData.append('cafeCity', childCityName || '');
    formData.append('cafeState', parentCityName || '');
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