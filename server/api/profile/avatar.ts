import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    try {
        const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(`${user.id}`, 60 * 60) // 1 hour expiry

        if (error && error.message !== 'The object was not found') {
            throw error
        }

        return { url: data?.signedUrl || null }
    } catch (error) {
        console.error('Error fetching avatar:', error)
        throw createError({
            statusCode: 500,
            message: 'Error fetching avatar'
        })
    }
})