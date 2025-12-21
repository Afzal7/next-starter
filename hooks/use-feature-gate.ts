'use client';

import { useState } from 'react'
import { useSubscription } from './use-subscription'

/**
 * Custom hook for feature gating based on subscription status
 * Automatically handles loading states and provides upgrade triggers
 *
 * @returns Feature gate state and upgrade modal controls
 */
export function useFeatureGate() {
  const { data: subscriptionData, isLoading } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const isPro = subscriptionData?.subscription?.status === 'active' || subscriptionData?.subscription?.status === 'trialing'

  const triggerUpgrade = () => {
    setShowUpgradeModal(true)
  }

  // Allow access if user is pro OR still loading (to prevent flash of locked content)
  const isAllowed = isPro || isLoading

  return {
    isAllowed,
    isPro,
    loading: isLoading,
    showUpgradeModal,
    setShowUpgradeModal,
    triggerUpgrade,
  }
}