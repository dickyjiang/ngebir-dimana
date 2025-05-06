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
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, updated_at')
            .eq('id', user.id)
            .single()

        if (error) throw error

        return { data }
    } catch (error) {
        console.error('Error fetching profile:', error)
        throw createError({
            statusCode: 500,
            message: 'Error fetching profile'
        })
    }
})