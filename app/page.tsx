/**
 * Root Page - Redirects to Dashboard
 *
 * This page permanently redirects users to the V2 dashboard layout.
 * The old V1 layout has been deprecated in favor of the sidebar-based V2 design.
 */

import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
