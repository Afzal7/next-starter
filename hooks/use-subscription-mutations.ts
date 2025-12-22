'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { subscription } from '@/lib/auth-client'

/**
 * Mutation hook for upgrading a subscription
 * Creates a Stripe checkout session and navigates to payment
 */
export function useUpgradeSubscription() {
  const queryClient = useQueryClient()
  const router = useRouter()
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
        cancelUrl: cancelUrl || `${window.location.origin}/dashboard/pricing?canceled=true`,
      })

      if (error) {
        throw new Error(error.message || 'Failed to create upgrade checkout')
      }

      return data
    },
    onSuccess: (data) => {
      // Navigate to Stripe checkout using Next.js router
      if (data?.url) {
        router.push(data.url)
      }

      // Invalidate subscription data after potential redirect back
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
    onError: (error) => {
      // Re-throw error for component-level handling instead of silent console logging
      throw error
    }
  })
}

/**
 * Mutation hook for cancelling a subscription
 * Creates a billing portal session for cancellation
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()
  const router = useRouter()
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
      // Navigate to Stripe billing portal using Next.js router
      if (data?.url) {
        router.push(data.url)
      }

      // Invalidate subscription data after potential changes
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
    onError: (error) => {
      // Re-throw error for component-level handling instead of silent console logging
      throw error
    }
  })
}