import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { uploadToR2 } from "../../../utils/cloudflare";
import { v4 as uuidv4 } from "uuid";
import { createError, type MultiPartData } from "h3";

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const user = await serverSupabaseUser(event);
	const formData = await readMultipartFormData(event);

	if (!formData) throw createError({ statusCode: 400, message: "Missing form data" });

	const cafeName = formData.find((f) => f.name === "cafeName")?.data?.toString() ?? '';
	const cafeStreet = formData.find((f) => f.name === "cafeStreet")?.data?.toString() ?? '';
	const cafeDescription = formData.find((f) => f.name === "cafeDescription")?.data?.toString() ?? '';
	const cafeSite = formData.find((f) => f.name === "cafeSite")?.data?.toString() ?? '';
	const cafePhoneNumber = formData.find((f) => f.name === "cafePhoneNumber")?.data?.toString() ?? '';
	const cafeCity = formData.find((f) => f.name === "cafeCity")?.data?.toString() ?? '';
	const cafeState = formData.find((f) => f.name === "cafeState")?.data?.toString() ?? '';
	// formData.append('cafeLocationLink', locationLink.value);
	const cafeLocationLink = formData.find((f) => f.name === "cafeLocationLink")?.data?.toString() ?? '';
	const cafeWorkingHours = formData.find((f) => f.name === "cafeWorkingHours")?.data?.toString() ?? '';


	const image = formData.find((f) => f.name === "image");
	const cafeLogo = formData.find((f) => f.name === "cafeLogo");
	// const images = formData.find((f) => f.name === "images[]");

	const multipleImages = formData.filter((f) => f.name === "images");

	let formattedWorkingHours = {};
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
		formattedWorkingHours = {};
	}
	console.log('formattedWorkingHours', formattedWorkingHours);

	// Helper function to format time from 24h to am/pm
	const cafeCitySlug = cafeCity
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, ''); // Remove consecutive hyphens
	const cafeStateSlug = cafeState
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, ''); // Remove consecutive hyphens

	let slug = cafeName
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-'); // Remove consecutive hyphens

	// Check if the slug already exists
	let isUnique = false;
	let counter = 0;
	let finalSlug = slug;

	while (!isUnique) {

		let query = client.from("cafes").select("id,name,slug_name", { count: "exact" });
		query = query.eq('slug_name', finalSlug)

		console.log('query', query);
		const { data, error, count } = await query

		if (error) throw createError({ statusMessage: error.message });
		// Make API call to check if slug exists

		if (count == 0) {
			isUnique = true;
			break;
		}

		// // If a duplicate exists, add first the child city
		if (counter === 0 && cafeCitySlug) {
			finalSlug = `${slug}-${cafeCitySlug}`;
		}
		// // If still a duplicate, add the parent city
		else if (counter === 1 && cafeStateSlug) {
			finalSlug = `${slug}-${cafeCitySlug}-${cafeStateSlug}`;
		}
		// // If all else fails, add a number that increments
		else {
			counter++;
			finalSlug = `${slug}-${counter}`;
		}
	}

	let logoUrl = null;
	if (cafeLogo && cafeLogo.data) {
		const logoKey = `${finalSlug}/${uuidv4()}.${cafeLogo?.filename?.split('.')[1]}`;
		logoUrl = await uploadToR2(cafeLogo.data, logoKey, cafeLogo.type || "image/jpeg");
	}



	let primaryImageUrl = null;
	if (image && image.data) {
		const imageKey = `${finalSlug}/${uuidv4()}.${image?.filename?.split('.')[1]}`;
		primaryImageUrl = await uploadToR2(image.data, imageKey, image.type || "image/jpeg");
	}
	const imageUrls = [];
	if (multipleImages.length > 0) {
		const uploadPromises = multipleImages.map(async (img) => {
			if (img.data) {
				const extension = img.filename?.split('.')[1] || 'jpg';
				const imageKey = `${finalSlug}/${uuidv4()}.${extension}`;
				const imageUrl = await uploadToR2(img.data, imageKey, img.type || "image/jpeg");
				return imageUrl;
			}
			return null;
		});

		// Wait for all uploads to complete
		const results = await Promise.all(uploadPromises);
		imageUrls.push(...results.filter(url => url !== null));
	}



	// const imageKey = `${slug}/${uuidv4()}.${image?.filename?.split('.')[1]}`;
	// const imageUrl = await uploadToR2(image.data, imageKey, image.type || "image/jpeg");


	const { data, error } = await client
		.from("cafes")
		.insert({
			name: cafeName,
			description: cafeDescription,
			site: cafeSite,
			phone: cafePhoneNumber,
			city: cafeCity,
			city_slug: cafeCitySlug,
			working_hours: formattedWorkingHours,
			location_link: cafeLocationLink,
			logo: logoUrl,
			slug_name: finalSlug,
			photo: primaryImageUrl,
			uuid: user?.id,
		})
		.select()
		.single();

	if (error) throw createError({ statusCode: 500, message: error.message });

	// Add additional images to cafe_pics
	if (imageUrls.length > 0) {
		const imagesToInsert = imageUrls.map(url => ({
			cafe_id: data.id,
			url: url
		}));

		const { error: additionalImagesError } = await client
			.from("cafe_pics")
			.insert(imagesToInsert);

		if (additionalImagesError) {
			console.error("Error saving additional images:", additionalImagesError);
		}
	}

	return {
		primaryImage: primaryImageUrl,
		additionalImages: imageUrls,
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