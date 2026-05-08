/**
 * useAnalytics — central GA4 event tracking composable.
 * All tracking logic lives here. No raw gtag calls anywhere else.
 * Uses nuxt-gtag's auto-imported useGtag() composable (already configured
 * in nuxt.config.ts with measurement ID G-BNWTEJPQY2).
 */
export function useAnalytics() {
  const { gtag } = useGtag()

  /**
   * Fires when user switches category filter type (All / Bar / Rooftop / Sports Bar / Brewery / Beach Club).
   * Measures which content categories users are most interested in browsing.
   */
  function trackCategoryTab(category_name: string) {
    gtag('event', 'category_tab_click', { category_name })
  }

  /**
   * Fires when a feature filter chip is toggled on or off
   * (e.g. WFC, Pet Friendly, 24 hours, Wheelchair Friendly, Specialty Coffee).
   * Measures which amenity filters drive the most engagement.
   */
  function trackFilter(filter_name: string, filter_state: 'on' | 'off') {
    gtag('event', 'filter_toggle', { filter_name, filter_state })
  }

  /**
   * Fires when user selects a city/district in the sidebar location filter.
   * Measures which cities/regions drive the most directory traffic.
   */
  function trackLocationFilter(city_name: string) {
    gtag('event', 'location_filter', { city_name })
  }

  /**
   * Fires when user clicks a cafe card to open its detail page.
   * Measures cafe discovery patterns and which listings get the most clicks.
   */
  function trackCafeClick(cafe_name: string, cafe_id: string | number, cafe_category: string) {
    gtag('event', 'cafe_click', { cafe_name, cafe_id, cafe_category })
  }

  /**
   * Fires when the Registrasi (sign-up) button is clicked.
   * Measures registration funnel entry rate and which button location drives it.
   */
  function trackRegistrationIntent(button_location: string) {
    gtag('event', 'registration_intent', { button_location })
  }

  /**
   * Fires when the Login button is clicked.
   * Measures login funnel entry rate.
   */
  function trackLoginClick() {
    gtag('event', 'login_click')
  }

  /**
   * GA4 built-in search event — fires after the user pauses typing (debounced).
   * Populates GA4's built-in Search report with the top search terms.
   * Skips empty or whitespace-only queries.
   */
  function trackSearch(search_term: string) {
    if (!search_term.trim()) return
    gtag('event', 'search', { search_term })
  }

  // Track which scroll depth milestones have been fired this page load.
  // A Set prevents the same milestone from firing more than once.
  const firedMilestones = new Set<number>()

  /**
   * Records a single scroll depth milestone (25 / 50 / 75 / 100).
   * Each milestone fires only once per page load via the firedMilestones Set.
   * Measures how far down the listing users scroll — a proxy for content engagement.
   */
  function trackScrollDepth(scroll_depth: number) {
    if (firedMilestones.has(scroll_depth)) return
    firedMilestones.add(scroll_depth)
    gtag('event', 'listing_scroll', { scroll_depth })
  }

  /**
   * Attaches a passive scroll listener that fires listing_scroll events at
   * 25 / 50 / 75 / 100% depth milestones — each fires only once per page load.
   * Returns a cleanup function; call it in onBeforeUnmount to prevent memory leaks.
   */
  function setupScrollTracking(): () => void {
    firedMilestones.clear()
    const milestones = [25, 50, 75, 100]

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const scrollPercent = Math.floor((scrollTop / docHeight) * 100)

      for (const milestone of milestones) {
        if (scrollPercent >= milestone) {
          trackScrollDepth(milestone)
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }

  return {
    trackCategoryTab,
    trackFilter,
    trackLocationFilter,
    trackCafeClick,
    trackRegistrationIntent,
    trackLoginClick,
    trackSearch,
    setupScrollTracking,
  }
}
