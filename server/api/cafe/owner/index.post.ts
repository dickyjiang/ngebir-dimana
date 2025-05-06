import { serverSupabaseClient } from "#supabase/server";
import { uploadToR2 } from "../../../utils/cloudflare";
import { v4 as uuidv4 } from "uuid";
import { createError, type MultiPartData } from "h3";

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const formData = await readMultipartFormData(event);

	if (!formData) throw createError({ statusCode: 400, message: "Missing form data" });

	const slug = formData.find((f) => f.name === "slug")?.data?.toString() ?? '';
	const image = formData.find((f) => f.name === "image");
	// const images = formData.find((f) => f.name === "images[]");
	const multipleImages = formData.filter((f) => f.name === "images");



	// if (!title || !file || !image || !description || !categories || !episode_number) {
	// 	throw createError({ statusCode: 400, message: "Missing required fields" });
	// }

	// const fileKey = `audios/${uuidv4()}.${file.filename?.split('.')[1]}`;
	// const fileUrl = await uploadToR2(file.data, fileKey, file.type || "audio/mpeg");

	let primaryImageUrl = null;
	if (image && image.data) {
		const imageKey = `${slug}/${uuidv4()}.${image?.filename?.split('.')[1]}`;
		primaryImageUrl = await uploadToR2(image.data, imageKey, image.type || "image/jpeg");
	}
	const imageUrls = [];
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
		imageUrls.push(...results.filter(url => url !== null));
	}



	// const imageKey = `${slug}/${uuidv4()}.${image?.filename?.split('.')[1]}`;
	// const imageUrl = await uploadToR2(image.data, imageKey, image.type || "image/jpeg");


	// const { data, error } = await client
	// 	.from("audios")
	// 	.insert({
	// 		title: title,
	// 		file_url: fileUrl,
	// 		description: description,
	// 		thumbnail_url: imageUrl,
	// 		episode_number: episode_number,
	// 		categories: categoriesArray, // Pass array directly
	// 		subtitle: subtitle,
	// 		meditationTimestamp: meditationTimestamp,
	// 	})
	// 	.select()
	// 	.single();

	// if (error) throw createError({ statusCode: 500, message: error.message });

	return {
		primaryImage: primaryImageUrl,
		additionalImages: imageUrls
	};
});
