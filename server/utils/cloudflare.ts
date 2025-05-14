import { AwsClient } from "aws4fetch";

const aws4fetch = new AwsClient({
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
});

export const uploadToR2 = async (file: Buffer, key: string, contentType: string) => {
    try {
        const endpoint = `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET}/${key}`;
        const response = await aws4fetch.fetch(endpoint, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': contentType,
            },
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
    } catch (err) {
        console.error('Error uploading to R2:', err);
        throw err;
    }
};

export const deleteFromR2 = async (key: string) => {
    try {
        const endpoint = `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET}/${key}`;
        const response = await aws4fetch.fetch(endpoint, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
        }
    } catch (err) {
        console.error('Error deleting from R2:', err);
        throw err;
    }
};