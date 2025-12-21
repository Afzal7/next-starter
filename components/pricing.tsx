'use client'

'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { subscription } from '@/lib/auth-client'
import { APP_CONFIG, getAllPlans } from '@/lib/config'

export default function Pricing() {
    const plans = getAllPlans();

    const handleUpgrade = async (planId: string) => {
        try {
            await subscription.upgrade({
                plan: planId,
                successUrl: `${window.location.origin}/trial-success`,
                cancelUrl: window.location.href,
            })
            // Better Auth handles the redirect to Stripe automatically
        } catch (error) {
            console.error('Upgrade failed:', error)
            alert('Failed to start upgrade process. Please try again.')
        }
    }

    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">
                        {APP_CONFIG.tagline}
                    </h1>
                    <p className="text-muted-foreground">
                        {APP_CONFIG.description}
                    </p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-lg border p-6 lg:p-10 ${
                                plan.id === 'pro'
                                    ? 'border-primary bg-primary/5 shadow-lg'
                                    : 'border-border'
                            }`}
                        >
                            <div className="space-y-4">
                                <div>
                                    <h2 className="font-medium">{plan.name}</h2>
                                    <span className="my-3 block text-2xl font-semibold">
                                        ${plan.price.monthly} / mo
                                    </span>
                                    <p className="text-muted-foreground text-sm">
                                        {plan.description}
                                    </p>
                                </div>

                                <Button
                                    onClick={plan.id === 'free'
                                        ? undefined
                                        : () => handleUpgrade(plan.id)
                                    }
                                    asChild={plan.id === 'free'}
                                    variant={plan.id === 'pro' ? 'default' : 'outline'}
                                    className="w-full"
                                >
                                    {plan.id === 'free' ? (
                                        <Link href="/dashboard">Continue Free</Link>
                                    ) : (
                                        `Start ${plan.trial?.enabled ? 'Free Trial' : 'Pro'}`
                                    )}
                                </Button>

                                <hr className="border-dashed" />

                                <ul className="list-outside space-y-3 text-sm">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li
                                            key={featureIndex}
                                            className="flex items-center gap-2"
                                        >
                                            <Check className="size-3 text-green-600" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
