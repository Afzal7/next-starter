'use client';

import { useMemo, useState } from 'react'
import { useSubscription } from './use-subscription'

/**
 * Business logic hook for feature gating based on subscription status
 * Safely handles loading states and provides feature access control
 *
 * @returns Feature access state with business logic applied
 */
export function useFeatureGate() {
  const { data: subscriptionData, isLoading } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Memoize subscription status to prevent unnecessary recalculations
  const subscriptionStatus = useMemo(() => {
    if (!subscriptionData?.subscription) return null

    const status = subscriptionData.subscription.status
    const isActive = status === 'active'
    const isTrialing = status === 'trialing'
    const isPastDue = status === 'past_due'
    const isCanceled = status === 'canceled'

    // Pro features are available for active, trialing, or past_due subscriptions
    // (past_due allows continued access during dunning period)
    const isPro = isActive || isTrialing || isPastDue

    return {
      id: subscriptionData.subscription.id,
      status,
      plan: subscriptionData.subscription.plan,
      isActive,
      isTrialing,
      isPastDue,
      isCanceled,
      isPro,
      periodEnd: subscriptionData.subscription.periodEnd,
      periodStart: subscriptionData.subscription.periodStart,
      cancelAtPeriodEnd: subscriptionData.subscription.cancelAtPeriodEnd,
      trialStart: subscriptionData.subscription.trialStart,
      trialEnd: subscriptionData.subscription.trialEnd,
      seats: subscriptionData.subscription.seats,
    }
  }, [subscriptionData])

  // Business logic: NEVER allow access while loading
  // This prevents flash content and security issues
  const featureAccess = useMemo(() => {
    if (isLoading) {
      return {
        allowed: false,
        loading: true,
        reason: 'loading',
      }
    }

    if (!subscriptionStatus) {
      return {
        allowed: false,
        loading: false,
        reason: 'no_subscription',
      }
    }

    return {
      allowed: subscriptionStatus.isPro,
      loading: false,
      reason: subscriptionStatus.isPro ? 'pro_user' : 'free_user',
      subscription: subscriptionStatus,
    }
  }, [isLoading, subscriptionStatus])

  const triggerUpgrade = () => {
    setShowUpgradeModal(true)
  }

  return {
    // Feature access
    allowed: featureAccess.allowed,
    loading: featureAccess.loading,
    reason: featureAccess.reason,

    // Subscription details
    subscriptionId: subscriptionStatus?.id ?? null,
    subscriptionStatus: subscriptionStatus?.status ?? null,
    subscriptionPlan: subscriptionStatus?.plan ?? null,
    periodEnd: subscriptionStatus?.periodEnd ?? null,
    periodStart: subscriptionStatus?.periodStart ?? null,
    cancelAtPeriodEnd: subscriptionStatus?.cancelAtPeriodEnd ?? false,
    trialStart: subscriptionStatus?.trialStart ?? null,
    trialEnd: subscriptionStatus?.trialEnd ?? null,
    seats: subscriptionStatus?.seats ?? null,

    // Computed properties
    isPro: subscriptionStatus?.isPro ?? false,
    isActive: subscriptionStatus?.isActive ?? false,
    isTrialing: subscriptionStatus?.isTrialing ?? false,
    isPastDue: subscriptionStatus?.isPastDue ?? false,
    isCanceled: subscriptionStatus?.isCanceled ?? false,

    // Upgrade modal controls (for backward compatibility)
    showUpgradeModal,
    setShowUpgradeModal,
    triggerUpgrade,
  }
}