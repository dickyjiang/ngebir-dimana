// filepath: /Users/budi/Documents/cafe-directories/server/api/cafe/owner/index.put.ts
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { uploadToR2 } from "../../../utils/cloudflare";
import { v4 as uuidv4 } from "uuid";
import { createError, type MultiPartData } from "h3";

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const user = await serverSupabaseUser(event);
	const formData = await readMultipartFormData(event);

	if (!formData) throw createError({ statusCode: 400, message: "Missing form data" });

	const cafeId = formData.find((f) => f.name === "cafeId")?.data?.toString();
	if (!cafeId) throw createError({ statusCode: 400, message: "Missing cafe ID" });

	// Check if user owns this cafe
	const { data: cafeData, error: cafeError } = await client
		.from("cafes")
		.select("*")
		.eq("id", cafeId)
		.eq("uuid", user?.id)
		.single();

	if (cafeError || !cafeData) {
		throw createError({
			statusCode: 403,
			message: "You don't have permission to edit this cafe"
		});
	}

	const cafeName = formData.find((f) => f.name === "cafeName")?.data?.toString() ?? cafeData.name;
	const cafeStreet = formData.find((f) => f.name === "cafeStreet")?.data?.toString() ?? cafeData.street;
	const cafeDescription = formData.find((f) => f.name === "cafeDescription")?.data?.toString() ?? cafeData.description;
	const cafeSite = formData.find((f) => f.name === "cafeSite")?.data?.toString() ?? cafeData.site;
	const cafePhoneNumber = formData.find((f) => f.name === "cafePhoneNumber")?.data?.toString() ?? cafeData.phone;
	const cafeCity = formData.find((f) => f.name === "cafeCity")?.data?.toString() ?? cafeData.city;
	const cafeState = formData.find((f) => f.name === "cafeState")?.data?.toString() ?? cafeData.state;
	const cafeLocationLink = formData.find((f) => f.name === "cafeLocationLink")?.data?.toString() ?? cafeData.location_link;
	const cafeWorkingHours = formData.find((f) => f.name === "cafeWorkingHours")?.data?.toString();

	// Check if there are existing images that should be preserved
	const hasExistingImages = formData.find((f) => f.name === "hasExistingImages")?.data?.toString() === "true";
	const existingImageUrls = formData.find((f) => f.name === "existingImageUrls")?.data?.toString();
	const hasExistingMenuImages = formData.find((f) => f.name === "hasExistingMenuImages")?.data?.toString() === "true";
	const existingMenuImageUrls = formData.find((f) => f.name === "existingMenuImageUrls")?.data?.toString();
	const hasExistingLogo = formData.find((f) => f.name === "hasExistingLogo")?.data?.toString() === "true";
	const existingLogoUrls = formData.find((f) => f.name === "existingLogoUrls")?.data?.toString();

	const image = formData.find((f) => f.name === "image");
	const cafeLogo = formData.find((f) => f.name === "cafeLogo");
	const multipleImages = formData.filter((f) => f.name === "images");
	const imagesToDelete = formData.find((f) => f.name === "imagesToDelete")?.data?.toString();
	const features = formData.find((f) => f.name === "features")

	let parsedFeatures = [];
	if (features && features.data) {
		try {
			const featuresString = features.data.toString();
			parsedFeatures = JSON.parse(featuresString);
		} catch (e) {
			console.error("Error parsing features:", e);
		}
	}


	let formattedWorkingHours = cafeData.working_hours;
	if (cafeWorkingHours) {
		try {
			const parsedHours = JSON.parse(cafeWorkingHours);

			if (Array.isArray(parsedHours)) {
				formattedWorkingHours = parsedHours.reduce((acc, day) => {
					if (day.isOpen && day.openTime && day.closeTime) {
						// Format times from 24h to am/pm format
						const openTime = formatTime(day.openTime);
						const closeTime = formatTime(day.closeTime);
						acc[day.name] = `${openTime}-${closeTime}`;
					} else {
						acc[day.name] = "Closed";
					}
					return acc;
				}, {});
			} else {
				// If already in object format, use as is
				formattedWorkingHours = parsedHours;
			}
		} catch (e) {
			console.error("Error parsing working hours:", e);
		}
	}

	const slug = cafeData.slug_name;

	// Handle logo - only upload if a new file was provided
	let logoUrl = cafeData.logo;
	if (cafeLogo && cafeLogo.data) {
		const logoKey = `${slug}/${uuidv4()}.${cafeLogo?.filename?.split('.')[1] || 'jpg'}`;
		logoUrl = await uploadToR2(cafeLogo.data, logoKey, cafeLogo.type || "image/jpeg");
	} else if (hasExistingLogo && existingLogoUrls) {
		try {
			// If the user has existing images but didn't upload a new one
			const parsedUrls = JSON.parse(existingLogoUrls);
			if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
				// Use the first image URL as the primary image if it exists
				logoUrl = parsedUrls[0];
			}
		} catch (e) {
			console.error("Error parsing existing image URLs:", e);
		}
	}

	// Handle primary image - only upload if a new file was provided
	let primaryImageUrl = cafeData.photo;
	if (image && image.data) {
		const imageKey = `${slug}/${uuidv4()}.${image?.filename?.split('.')[1] || 'jpg'}`;
		primaryImageUrl = await uploadToR2(image.data, imageKey, image.type || "image/jpeg");
	} else if (hasExistingImages && existingImageUrls) {
		try {
			// If the user has existing images but didn't upload a new one
			const parsedUrls = JSON.parse(existingImageUrls);
			if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
				// Use the first image URL as the primary image if it exists
				primaryImageUrl = parsedUrls[0];
			}
		} catch (e) {
			console.error("Error parsing existing image URLs:", e);
		}
	}

	// Handle new additional images
	const newImageUrls = [];
	if (multipleImages.length > 0) {
		const uploadPromises = multipleImages.map(async (img) => {
			if (img.data) {
				const extension = img.filename?.split('.')[1] || 'jpg';
				const imageKey = `${slug}/${uuidv4()}.${extension}`;
				const imageUrl = await uploadToR2(img.data, imageKey, img.type || "image/jpeg");
				return imageUrl;
			}
			return null;
		});

		// Wait for all uploads to complete
		const results = await Promise.all(uploadPromises);
		newImageUrls.push(...results.filter(url => url !== null));
	}

	// Handle existing menu/additional images
	let preserveExistingMenuImages = [];
	if (hasExistingMenuImages && existingMenuImageUrls) {
		try {
			const parsedMenuUrls = JSON.parse(existingMenuImageUrls);
			if (Array.isArray(parsedMenuUrls)) {
				preserveExistingMenuImages = parsedMenuUrls;
			}
		} catch (e) {
			console.error("Error parsing existing menu image URLs:", e);
		}
	}

	// Delete images if needed
	if (imagesToDelete) {
		try {
			const imageIds = JSON.parse(imagesToDelete);
			if (Array.isArray(imageIds) && imageIds.length > 0) {
				const { error: deleteError } = await client
					.from("cafe_pics")
					.delete()
					.in("url", imageIds);

				if (deleteError) {
					console.error("Error deleting images:", deleteError);
				}
			}
		} catch (e) {
			console.error("Error parsing images to delete:", e);
		}
	}

	// Update cafe data
	const { data, error } = await client
		.from("cafes")
		.update({
			name: cafeName,
			description: cafeDescription,
			site: cafeSite,
			phone: cafePhoneNumber,
			city: cafeCity,
			state: cafeState,
			street: cafeStreet,
			working_hours: formattedWorkingHours,
			location_link: cafeLocationLink,
			logo: logoUrl,
			photo: primaryImageUrl,
			datetime: new Date().toISOString(),
		})
		.eq("id", cafeId)
		.select()
		.single();

	if (error) throw createError({ statusCode: 500, message: error.message });

	// Handle cafe_pics management

	if (parsedFeatures.length > 0) {
		const featuresToInsert = parsedFeatures.map(feature => ({
			cafe_id: cafeId,
			feature_id: feature.id
		}));
		// First, delete features that are not in the new list
		const featureIdsToKeep = parsedFeatures.map(feature => feature.id);

		const { error: deleteError } = await client
			.from("cafe_features")
			.delete()
			.eq("cafe_id", cafeId)
			.not("feature_id", "in", `(${featureIdsToKeep.join(',')})`);

		if (deleteError) {
			console.error("Error removing old cafe features:", deleteError);
		}

		const { error: featuresError } = await client
			.from("cafe_features")
			.upsert(featuresToInsert);

		if (featuresError) {
			console.error("Error saving cafe features:", featuresError);
		}
	} else {

		const { error: deleteAllError } = await client
			.from("cafe_features")
			.delete()
			.eq("cafe_id", cafeId);

		if (deleteAllError) {
			console.error("Error removing all cafe features:", deleteAllError);
		}
	}

	// First, get existing pics to compare
	const { data: existingPics, error: existingPicsError } = await client
		.from("cafe_pics")
		.select("id, url")
		.eq("cafe_id", cafeId);

	if (existingPicsError) {
		console.error("Error fetching existing pics:", existingPicsError);
	}

	// Add new additional images to cafe_pics
	if (newImageUrls.length > 0) {
		const imagesToInsert = newImageUrls.map(url => ({
			cafe_id: cafeId,
			url: url
		}));

		const { error: additionalImagesError } = await client
			.from("cafe_pics")
			.insert(imagesToInsert);

		if (additionalImagesError) {
			console.error("Error saving additional images:", additionalImagesError);
		}
	}

	// Handle preserving existing menu images
	if (preserveExistingMenuImages.length > 0) {
		// Check which URLs are already in the database
		const existingUrls = existingPics?.map(pic => pic.url) || [];

		// Filter out URLs that are already in the database
		const urlsToAdd = preserveExistingMenuImages.filter(url => !existingUrls.includes(url));

		if (urlsToAdd.length > 0) {
			const imagesToInsert = urlsToAdd.map(url => ({
				cafe_id: cafeId,
				url: url
			}));

			const { error: preserveImagesError } = await client
				.from("cafe_pics")
				.insert(imagesToInsert);

			if (preserveImagesError) {
				console.error("Error preserving existing menu images:", preserveImagesError);
			}
		}
	}

	// Get updated images
	const { data: cafeImages } = await client
		.from("cafe_pics")
		.select("*")
		.eq("cafe_id", cafeId);

	return {
		primaryImage: primaryImageUrl,
		additionalImages: cafeImages || [],
		data: data
	};
});

function formatTime(time24h) {
	try {
		const [hours, minutes] = time24h.split(':').map(num => parseInt(num, 10));
		const period = hours >= 12 ? 'pm' : 'am';
		const hours12 = hours % 12 || 12;
		return `${hours12}.${minutes.toString().padStart(2, '0')}${period}`;
	} catch (e) {
		return time24h;
	}
}