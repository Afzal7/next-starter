import Pricing from '@/components/pricing'

export default function UpgradePage() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
                <p className="text-muted-foreground mt-2">
                    Choose the plan that&apos;s right for you
                </p>
            </div>
            <Pricing />
        </div>
    )
}