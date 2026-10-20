/**
 * Client-side analytics guard + Google Tag Manager loader.
 *
 * - GTM container ID comes from NUXT_PUBLIC_GTM_ID (runtimeConfig.public.gtmId).
 *   Empty → GTM is not loaded at all.
 * - Nothing is tracked on /admin routes:
 *   - nuxt-gtag: sets the `ga-disable-<GA4 ID>` flag while on /admin (blocks every
 *     hit for that measurement ID, including the initial page_view).
 *   - GTM: not injected when the visit starts on /admin; injected on the first
 *     navigation to a public page instead.
 */
const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/')

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public
  const gtmId = (config.gtmId as string) || ''
  const hasGtag = Boolean((config.gtag as { id?: string } | undefined)?.id)
  const router = useRouter()
  const { disableAnalytics, enableAnalytics } = useGtag()

  function applyGtagGuard(path: string) {
    if (!hasGtag) return
    if (isAdminPath(path)) disableAnalytics()
    else enableAnalytics()
  }

  let gtmLoaded = false
  function initGTM() {
    if (!gtmId || gtmLoaded) return
    gtmLoaded = true
    const w = window as any
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
    document.head.appendChild(script)
  }

  // Runs synchronously at app start, before the deferred gtag.js script executes,
  // so the initial page_view is also suppressed when landing on /admin.
  applyGtagGuard(window.location.pathname)
  if (!isAdminPath(window.location.pathname)) initGTM()

  router.beforeEach((to) => {
    applyGtagGuard(to.path)
  })
  router.afterEach((to) => {
    if (!isAdminPath(to.path)) initGTM()
  })
})
