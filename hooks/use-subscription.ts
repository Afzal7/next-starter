'use client';

import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { subscription } from '@/lib/auth-client'

export interface SubscriptionData {
  subscription?: {
    id?: string
    status?: string
    plan?: string
    periodEnd?: string
    periodStart?: string
    cancelAtPeriodEnd?: boolean
    trialStart?: string
    trialEnd?: string
    seats?: number
  }
}

/**
 * Custom hook for fetching user subscription data with caching
 * Uses TanStack Query for automatic caching, background refetching, and error handling
 *
 * @returns Query result with subscription data, loading state, and error handling
 */
export function useSubscription() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async (): Promise<SubscriptionData | null> => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data: subscriptions, error } = await subscription.list({
        query: {
          referenceId: session.user.id,
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch subscription')
      }

      if (!subscriptions || subscriptions.length === 0) {
        return null // Free tier - no subscription
      }

      // Find the most relevant active subscription
      // Priority: active > trialing > past_due > canceled (if not expired)
      const priorityOrder = ['active', 'trialing', 'past_due', 'canceled']
      const activeSubscription = subscriptions
        .filter(sub => {
          if (sub.status === 'canceled') {
            // Only include canceled subscriptions that haven't expired
            return sub.periodEnd && new Date(sub.periodEnd) > new Date()
          }
          return priorityOrder.includes(sub.status)
        })
        .sort((a, b) => {
          const aPriority = priorityOrder.indexOf(a.status)
          const bPriority = priorityOrder.indexOf(b.status)
          return aPriority - bPriority
        })[0]

      if (!activeSubscription) {
        return null // No active subscription found
      }

      return {
        subscription: {
          id: activeSubscription.id,
          status: activeSubscription.status,
          plan: activeSubscription.plan,
          periodEnd: activeSubscription.periodEnd?.toISOString(),
          periodStart: activeSubscription.periodStart?.toISOString(),
          cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          trialStart: activeSubscription.trialStart?.toISOString(),
          trialEnd: activeSubscription.trialEnd?.toISOString(),
          seats: activeSubscription.seats,
        },
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes (reasonable for subscriptions)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnReconnect: true, // Refresh when connection restored
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return false
      }
      // Retry up to 3 times for other errors with exponential backoff
      return failureCount < 3
    },
  })
}