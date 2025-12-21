import { useState } from 'react'
import { useSubscription } from './use-subscription'

export function useFeatureGate() {
  const { subscriptionData, loading } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const isPro = subscriptionData?.subscription?.status === 'active' || subscriptionData?.subscription?.status === 'trialing'

  const triggerUpgrade = () => {
    setShowUpgradeModal(true)
  }

  const isAllowed = isPro || loading

  return {
    isAllowed,
    isPro,
    loading,
    showUpgradeModal,
    setShowUpgradeModal,
    triggerUpgrade,
  }
}