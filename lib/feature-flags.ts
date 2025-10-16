import { cookies } from 'next/headers'

/**
 * Feature Flags for Bready
 *
 * Allows toggling between old and new UI layouts for safe testing and gradual rollout.
 */

export const FeatureFlags = {
  /**
   * New sidebar navigation layout
   *
   * Controls whether to show the new sidebar-based navigation with dedicated pages
   * for Dashboard, Expenses, Budgets, and Insights.
   *
   * Toggle methods:
   * 1. Environment variable: NEXT_PUBLIC_USE_NEW_LAYOUT=false (to disable)
   * 2. Cookie: layout-version=v1 (to use old layout)
   * 3. Default: true (use new layout)
   */
  NEW_NAVIGATION: process.env.NEXT_PUBLIC_USE_NEW_LAYOUT !== 'false',
}

/**
 * Check if the new layout should be used
 *
 * Priority order:
 * 1. Cookie override (for testing)
 * 2. Environment variable
 * 3. Default to true (new layout)
 */
export async function useNewLayout(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const layoutCookie = cookieStore.get('layout-version')?.value

    // Cookie override for testing
    if (layoutCookie === 'v1') return false
    if (layoutCookie === 'v2') return true

    // Environment variable or default to true
    return FeatureFlags.NEW_NAVIGATION
  } catch (error) {
    console.error('Error checking feature flags:', error)
    return true // Default to new layout
  }
}

/**
 * Get current layout version
 */
export async function getLayoutVersion(): Promise<'v1' | 'v2'> {
  const useNew = await useNewLayout()
  return useNew ? 'v2' : 'v1'
}
