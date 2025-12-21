import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  featureName?: string
  ctaText?: string
  showTrial?: boolean
}

export function UpgradeModal({
  open,
  onOpenChange,
  title = "Upgrade to Pro",
  description = "Unlock this feature and many more with a Pro subscription.",
  featureName,
  ctaText = "Start Free Trial",
  showTrial = true,
}: UpgradeModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onOpenChange(false)
    router.push('/dashboard/upgrade')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {featureName ? `Unlock ${featureName} and ` : ''}
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">What you&apos;ll unlock:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unlimited access to all features</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Priority support</li>
              <li>• Team collaboration tools</li>
            </ul>
          </div>

          {showTrial && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>14-day free trial</strong> - No credit card required
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade}>
            {ctaText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}