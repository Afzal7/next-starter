import { useSession } from '@/lib/auth-client'
import { subscription } from '@/lib/auth-client'
import { useEffect, useState } from 'react'

export interface SubscriptionData {
  subscription?: {
    status?: string
    periodEnd?: string
    cancelAtPeriodEnd?: boolean
  }
  isPro?: boolean
}

export function useSubscription() {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data: subscriptions, error } = await subscription.list({
          query: {
            referenceId: session.user.id,
          },
        })

        if (error) {
          setError(error.message || 'Failed to fetch subscription')
          return
        }

        // Get the active subscription (or most recent if expired)
        const activeSubscription = subscriptions.find(
          sub => sub.status === "active" || sub.status === "trialing"
        )

        // If no active subscription, check for expired/canceled ones
        const expiredSubscription = subscriptions.find(
          sub => sub.status === "canceled" && sub.periodEnd && new Date(sub.periodEnd) < new Date()
        )

        setSubscriptionData(activeSubscription ? {
          subscription: {
            status: activeSubscription.status,
            periodEnd: activeSubscription.periodEnd?.toISOString(),
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          },
          isPro: true,
        } : expiredSubscription ? {
          subscription: {
            status: expiredSubscription.status,
            periodEnd: expiredSubscription.periodEnd?.toISOString(),
            cancelAtPeriodEnd: expiredSubscription.cancelAtPeriodEnd,
          },
          isPro: false,
        } : null)
      } catch {
        setError('Failed to load subscription data')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [session])

  return {
    subscriptionData,
    loading,
    error,
    refetch: () => {
      if (session?.user) {
        // Re-run the effect by updating a dependency
        setLoading(true)
        setError(null)
      }
    }
  }
}