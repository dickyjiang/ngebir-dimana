import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    console.log('index post:')
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    console.log('user post:', user)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    try {
        // Get request body
        const { name } = await readBody(event)

        // Update profile in database
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: name,
                updated_at: new Date()
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