'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { subscription } from '@/lib/auth-client'

/**
 * Mutation hook for upgrading a subscription
 * Creates a Stripe checkout session and redirects to payment
 */
export function useUpgradeSubscription() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: async ({
      plan,
      annual,
      successUrl,
      cancelUrl
    }: {
      plan: string
      annual?: boolean
      successUrl?: string
      cancelUrl?: string
    }) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await subscription.upgrade({
        plan,
        annual,
        referenceId: session.user.id,
        successUrl: successUrl || `${window.location.origin}/dashboard?upgraded=true`,
        cancelUrl: cancelUrl || `${window.location.origin}/pricing?canceled=true`,
      })

      if (error) {
        throw new Error(error.message || 'Failed to create upgrade checkout')
      }

      return data
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url
      }

      // Invalidate subscription data after potential redirect back
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
    onError: (error) => {
      console.error('Upgrade failed:', error)
      // Error handling is done at the component level
    }
  })
}

/**
 * Mutation hook for cancelling a subscription
 * Creates a billing portal session for cancellation
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: async ({
      returnUrl
    }: {
      returnUrl?: string
    }) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await subscription.cancel({
        referenceId: session.user.id,
        returnUrl: returnUrl || window.location.href,
      })

      if (error) {
        throw new Error(error.message || 'Failed to create cancellation portal')
      }

      return data
    },
    onSuccess: (data) => {
      // Redirect to Stripe billing portal
      if (data?.url) {
        window.location.href = data.url
      }

      // Invalidate subscription data after potential changes
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
    onError: (error) => {
      console.error('Cancellation failed:', error)
      // Error handling is done at the component level
    }
  })
}

