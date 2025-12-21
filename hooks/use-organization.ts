'use client';

import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { orgClient } from '@/lib/auth-client'

export interface Organization {
  id: string
  name: string
  slug: string
}

/**
 * Custom hook for fetching user organizations with caching
 * Uses TanStack Query for automatic caching, background refetching, and error handling
 *
 * @returns Query result with organization data, loading state, and error handling
 */
export function useOrganization() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['organizations', session?.user?.id],
    queryFn: async (): Promise<Organization | null> => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await orgClient.list({
        query: { userId: session.user.id },
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch organization')
      }

      // Return the first organization (assuming single org per user for now)
      return data && data.length > 0 ? data[0] : null
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
  })
}