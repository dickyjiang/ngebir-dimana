import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    const formData = await readMultipartFormData(event);

    const name = formData.find((f) => f.name === "name")?.data?.toString() ?? '';
    const phone_number = formData.find((f) => f.name === "phone_number")?.data?.toString() ?? '';
    const bio_profile = formData.find((f) => f.name === "bio_profile")?.data?.toString() ?? '';
    const avatar_url = formData.find((f) => f.name === "avatar");
    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    let logoUrl = null;
    if (avatar_url && avatar_url.data) {
        const logoKey = `profile/${user.id}.${avatar_url?.filename?.split('.')[1]}`;
        logoUrl = await uploadToR2(avatar_url.data, logoKey, avatar_url.type || "image/jpeg");
    }

    console.log('logoUrl', logoUrl);
    try {
        // Get request body

        // Update profile in database
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: name,
                phone_number: phone_number,
                bio_profile: bio_profile,
                updated_at: new Date(),
                avatar_url: logoUrl
            })

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error updating profile:', error)
        throw createError({
            statusCode: 500,
            message: 'Error updating profile'
        })
    }
})