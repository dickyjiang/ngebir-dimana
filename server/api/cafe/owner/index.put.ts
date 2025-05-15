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

	const image = formData.find((f) => f.name === "image");
	const cafeLogo = formData.find((f) => f.name === "cafeLogo");
	const multipleImages = formData.filter((f) => f.name === "images");
	const imagesToDelete = formData.find((f) => f.name === "imagesToDelete")?.data?.toString();

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

	let logoUrl = cafeData.logo;
	if (cafeLogo && cafeLogo.data) {
		const logoKey = `${slug}/${uuidv4()}.${cafeLogo?.filename?.split('.')[1]}`;
		logoUrl = await uploadToR2(cafeLogo.data, logoKey, cafeLogo.type || "image/jpeg");
	}

	let primaryImageUrl = cafeData.photo;
	if (image && image.data) {
		const imageKey = `${slug}/${uuidv4()}.${image?.filename?.split('.')[1]}`;
		primaryImageUrl = await uploadToR2(image.data, imageKey, image.type || "image/jpeg");
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

	// Delete images if needed
	if (imagesToDelete) {
		try {
			const imageIds = JSON.parse(imagesToDelete);
			if (Array.isArray(imageIds) && imageIds.length > 0) {
				const { error: deleteError } = await client
					.from("cafe_pics")
					.delete()
					.in("id", imageIds);

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
			working_hours: formattedWorkingHours,
			location_link: cafeLocationLink,
			logo: logoUrl,
			photo: primaryImageUrl,
			updated_at: new Date().toISOString(),
		})
		.eq("id", cafeId)
		.select()
		.single();

	if (error) throw createError({ statusCode: 500, message: error.message });

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