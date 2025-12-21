'use client';

import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { subscription } from '@/lib/auth-client'

export interface SubscriptionData {
  subscription?: {
    status?: string
    periodEnd?: string
    cancelAtPeriodEnd?: boolean
  }
  isPro?: boolean
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
        return null
      }

      // Get the active subscription (or most recent if expired)
      const activeSubscription = subscriptions.find(
        sub => sub.status === "active" || sub.status === "trialing"
      )

      // If no active subscription, check for expired/canceled ones
      const expiredSubscription = subscriptions.find(
        sub => sub.status === "canceled" && sub.periodEnd && new Date(sub.periodEnd) > new Date()
      )

      if (activeSubscription) {
        return {
          subscription: {
            status: activeSubscription.status,
            periodEnd: activeSubscription.periodEnd?.toISOString(),
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          },
          isPro: true,
        }
      }

      if (expiredSubscription) {
        return {
          subscription: {
            status: expiredSubscription.status,
            periodEnd: expiredSubscription.periodEnd?.toISOString(),
            cancelAtPeriodEnd: expiredSubscription.cancelAtPeriodEnd,
          },
          isPro: false,
        }
      }

      return null
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