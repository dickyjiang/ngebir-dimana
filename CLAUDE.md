# Ngopi di Mana - Cafe Directory

Indonesian cafe directory website at https://ngopi.di-mana.com

## Tech Stack

- **Framework:** Nuxt 3 (Vue 3, Composition API with `<script setup>`)
- **Styling:** Tailwind CSS (via `@nuxtjs/tailwindcss`)
- **Icons:** Font Awesome Free (`@fortawesome/fontawesome-free`)
- **Animations:** Lottie Web (`lottie-web`) - JSON-based animations
- **Images:** `@nuxt/image` (NuxtImg component), domain: `storage.di-mana.com`
- **Maps:** Leaflet (`@nuxtjs/leaflet`)
- **Backend:** Supabase (`@nuxtjs/supabase`) for auth & database
- **Analytics:** Google Tag via `nuxt-gtag` (ID: `G-BNWTEJPQY2`)
- **Deployment:** Cloudflare Pages (SSR)

## Design System

### Typography

- **Brand font:** "Sharp Grotesk" - used for headings (h1, h2 in Navbar and Hero)
  - Files: `assets/fonts/sharp-grotesk-medium-25-regular.woff`, `sharp-grotesk-smbold-20-regular.woff`
  - Loaded via `@font-face` in component `<style scoped>` blocks (Navbar.vue, HeroSearch.vue)
- **Body font:** System default / Tailwind sans-serif stack
- **Text sizes used:** `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-2xl`, `text-4xl`, `text-5xl` (responsive)

### Color Palette

| Role | Color | Tailwind Class |
|------|-------|----------------|
| Background (main) | White | `bg-white` |
| Background (footer) | Dark gray | `bg-gray-900` |
| Text (primary) | Dark gray | `text-gray-800` |
| Text (secondary) | Medium gray | `text-gray-500` |
| Text (muted) | Light gray | `text-gray-400` |
| Accent (active state) | Yellow | `text-yellow-500` |
| Accent (active bg) | Black | `bg-black` |
| Active border | Yellow | `border-yellow-500` |
| Inactive border | Gray | `border-gray-400` |
| Hero overlay | Black 60% opacity | `bg-black opacity-60` |
| Toast success | Green | `bg-green-100 text-green-800 border-green-500` |
| Toast error | Red | `bg-red-100 text-red-800 border-red-500` |
| Toast info | Blue | `bg-blue-100 text-blue-800 border-blue-500` |
| Category pill | Light gray | `bg-gray-200` |
| Blog category badge | Dark | `bg-gray-800 text-white` |

### Key Design Patterns

**Active/Inactive Toggle (filter chips):**
- Active: `text-yellow-500 bg-black border border-yellow-500`
- Inactive: `text-gray-100 border-gray-400`
- Shape: `rounded-full` pill buttons

**Navigation links (hover):**
- `transition-colors hover:bg-black hover:text-yellow-500`
- Shape: `rounded-lg` with `px-3 py-2`

**Cards (cafe & blog):**
- `rounded-md border overflow-hidden` with `hover:shadow-md hover:border-gray-300`
- Image at top, content below with `px-4` padding
- Title: `text-lg font-semibold text-gray-800 line-clamp-2`
- Description: `text-sm text-gray-500 line-clamp-2`

**Grid layouts:**
- Cafe list: `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Responsive breakpoints follow Tailwind defaults (md: 768px, lg: 1024px)

**Container widths:**
- Navbar: `max-w-[90%] lg:max-w-[98%] mx-auto`
- Hero: `container mx-auto lg:max-w-[98%]`
- Footer: `max-w-7xl w-full mx-auto`
- General content: `container mx-auto`

### Layout Structure

- `layouts/default.vue` - Public pages: Navbar + content + Footer in flex column
- `layouts/member.vue` - Authenticated pages with sidebar
- Navbar has responsive mobile drawer menu (slide-in from right, `w-64`)

### Skeleton Loading

- Background: `#e0e0e0` with pulse animation (opacity 1 -> 0.4 -> 1, 1.5s)
- Used in cafe list cards during loading state

### Lottie Animations

Located in `public/animations/`:
- `coffee-shop.json` - Navbar logo animation
- `24-hours.json`, `coffee-beans.json`, `golden-retriever.json`, `wfc.json`, `terdekat.json`, `wheelchair.json` - Hero filter chip icons
- Animations play on hover, stay playing when filter is active

### Static Assets

Located in `src/assets/img/`:
- `hero.webp` - Hero background image
- `logo_ndm.svg` / `logo_ndm_gray.svg` - Brand logos (color / gray for footer)
- `city.svg`, `rating.svg` - Small icons for cafe cards
- `noImg_placeholder.webp` - Fallback image (referenced as `/img/noimg.webp` in public)
- `wheelchair_Y.svg` / `wheelchair_N.svg` - Accessibility indicators
- Various UI icons: `cafe.svg`, `coffee-beans.svg`, `love.svg`, `send.svg`, `thumb-up.svg`, `thumb-down.svg`, etc.

### Custom Tailwind Config

- Custom `scrollbar-hide` utility (hides scrollbar cross-browser)
- Custom `bg-hero` background image utility
- No extended colors, spacing, or breakpoints - uses Tailwind defaults

### Component Architecture

```
components/
  Navbar.vue          - Top navigation with Lottie logo, responsive drawer menu
  Footer.vue          - Dark footer with links and copyright
  HeroSearch.vue      - Hero banner with search + filter chips (Lottie icons)
  PopularCategories.vue - Category pills display
  Sidebar.vue         - Member area sidebar
  ToastNotification.vue - Toast alerts (success/error/info)
  WorldOfCoffeeBanner.vue - Promotional banner
  CafeForm.vue        - Cafe submission/edit form
  cafe/
    CafeList.vue      - Paginated grid of cafe cards with skeleton loading
    NewCafesList.vue   - New cafes listing
  blog/
    BlogCard.vue      - Blog post card
```

### Language

- UI is primarily in **Bahasa Indonesia** (Indonesian)
- Some labels are in English (search, filter names)

### Conventions

- Use Tailwind utility classes inline (no custom CSS classes unless necessary)
- Use `<script setup>` with Composition API
- Use `NuxtLink` for internal navigation, `NuxtImg` for optimized images
- Supabase client via `useSupabaseClient()` composable
- Analytics tracking via `useAnalytics()` composable
- SEO via `useSeo()` composable
