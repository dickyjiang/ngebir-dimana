import { ref } from 'vue'

export interface BlogPost {
  id: number
  title: string
  slug: string
  description: string | null
  content?: string | null
  cover_image_url: string | null
  category: string | null
  published_at: string
  created_at?: string
  is_published?: boolean
}

export function useBlog() {
  const supabase = useSupabaseClient()
  const posts = ref<BlogPost[]>([])
  const post = ref<BlogPost | null>(null)
  const loading = ref(false)
  const total = ref(0)

  // Paginated listing — used by pages/blog/index.vue
  async function fetchPosts(page = 1, limit = 9) {
    loading.value = true
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, count } = await supabase
      .from('blogs')
      .select('id, title, slug, description, cover_image_url, category, published_at', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(from, to)
    total.value = count || 0
    posts.value = (data as BlogPost[]) || []
    loading.value = false
  }

  // Single post by slug — used by pages/blog/[slug].vue
  async function fetchPostBySlug(slug: string) {
    loading.value = true
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    post.value = data as BlogPost | null
    loading.value = false
  }

  // 3 related posts (same category, exclude current) — used by pages/blog/[slug].vue
  async function fetchRelatedPosts(currentSlug: string, category: string): Promise<BlogPost[]> {
    const { data } = await supabase
      .from('blogs')
      .select('id, title, slug, description, cover_image_url, category, published_at')
      .eq('is_published', true)
      .eq('category', category)
      .neq('slug', currentSlug)
      .order('published_at', { ascending: false })
      .limit(3)
    return (data as BlogPost[]) || []
  }

  // 4 latest posts — used by homepage "Artikel & Tips" preview section
  async function fetchLatestPosts(): Promise<BlogPost[]> {
    const { data } = await supabase
      .from('blogs')
      .select('id, title, slug, description, cover_image_url, category, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(4)
    return (data as BlogPost[]) || []
  }

  return { posts, post, loading, total, fetchPosts, fetchPostBySlug, fetchRelatedPosts, fetchLatestPosts }
}
