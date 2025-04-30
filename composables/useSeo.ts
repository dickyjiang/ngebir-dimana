import { useHead } from '#app'

export function useSeo(options: {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  fbAppId?: string
}) {
  const defaults = {
    title: 'Website Paling Lengkap buat Cari Tempat Ngopi!',
    description: 'Satu Klik, Ribuan Cafe! Temukan yang Pas untuk Kamu.',
    image: '/img/og-img.png',
    url: 'https://ngopi.di-mana.com',
    type: 'website',
    fbAppId: '2385267795184767' // Replace with your actual Facebook App ID
  }

  const title = options.title || defaults.title
  const description = options.description || defaults.description
  const image = options.image || defaults.image
  const url = options.url || defaults.url
  const type = options.type || defaults.type
  const fbAppId = options.fbAppId || defaults.fbAppId

  // Convert relative image URLs to absolute URLs
  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `${process.env.NODE_ENV === 'production'
      ? 'https://ngopi.di-mana.com'
      : 'http://localhost:3000'}${image}`

  useHead({
    title,
    meta: [
      // Standard meta tags
      { name: 'description', content: description },

      // Open Graph meta tags
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: absoluteImageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'fb:app_id', content: fbAppId },

      // Twitter Card meta tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: absoluteImageUrl }
    ],
    link: [
      { rel: 'canonical', href: url }
    ]
  })
} 