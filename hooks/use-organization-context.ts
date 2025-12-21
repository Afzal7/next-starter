'use client';

import { usePathname } from 'next/navigation'

export function useOrganizationContext() {
  const pathname = usePathname()
  const orgMatch = pathname.match(/^\/dashboard\/organizations\/([^\/]+)/)

  if (!orgMatch) return null

  const orgId = orgMatch[1]
  const isOrgPage = pathname.startsWith(`/dashboard/organizations/${orgId}`)

  return {
    orgId,
    isOrgPage,
    currentSection: pathname.split('/').pop() || 'overview'
  }
}