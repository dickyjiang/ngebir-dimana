/**
 * Validates and processes image file uploads
 * @param file The file to validate
 * @param maxFileSize Maximum file size in bytes
 * @returns Object containing validation result and error message if any
 */
export const validateImageFile = (file: File, maxFileSize: number) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        return {
            valid: false,
            error: `${file.name} is not an image file.`
        };
    }

    // Validate file size
    if (file.size > maxFileSize) {
        return {
            valid: false,
            error: `${file.name} exceeds the ${maxFileSize / (1024 * 1024)}MB file size limit.`
        };
    }

    return { valid: true, error: null };
};

/**
 * Creates a data URL preview for an image file
 * @param file The image file to preview
 * @returns Promise resolving to a data URL string
 */
export const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                resolve(e.target.result as string);
            } else {
                reject(new Error('Failed to create image preview'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(file);
    });
};

/**
 * Handles the upload of single or multiple image files
 * @param files Array of files to process
 * @param maxFileSize Maximum file size in bytes
 * @param maxCount Maximum number of files allowed
 * @param currentCount Current number of files already uploaded
 * @returns Object containing processed files, previews, and errors
 */
export const processImageUpload = async (
    files: File[],
    maxFileSize: number,
    maxCount: number,
    currentCount: number = 0
) => {
    const validFiles: File[] = [];
    const previews: string[] = [];
    const errors: string[] = [];
    const progress: number[] = [];

    // Check if adding these files would exceed the maximum
    if (currentCount + files.length > maxCount) {
        errors.push(`You can upload a maximum of ${maxCount} images.`);
        return { validFiles, previews, errors, progress };
    }

    // Process each file
    for (const file of files) {
        const validation = validateImageFile(file, maxFileSize);

        if (!validation.valid) {
            errors.push(validation.error as string);
            continue;
        }

        validFiles.push(file);
        progress.push(0);

        try {
            const preview = await createImagePreview(file);
            previews.push(preview);
        } catch (error) {
            errors.push(`Failed to create preview for ${file.name}`);
        }
    }

    return { validFiles, previews, errors, progress };
};