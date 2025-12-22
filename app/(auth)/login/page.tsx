'use client'

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorState } from '@/components/shared/error-state'
import { OAuthButton } from '@/components/shared/oauth-button'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await signIn.email({ email, password })
            router.push('/dashboard')
        } catch {
            setError('Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSubmit}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-xl border p-0.5 shadow-md">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            <LogoIcon />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In</h1>
                        <p className="text-sm">Welcome back! Sign in to continue</p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <OAuthButton provider="google" />
                        <OAuthButton provider="microsoft" />
                    </div>

                    {error && <ErrorState message={error} />}

                    <hr className="my-4 border-dashed" />

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm">
                                    Password
                                </Label>
                                <Button
                                    asChild
                                    variant="link"
                                    size="sm">
                                    <Link
                                        href="/forgot-password"
                                        className="link intent-info variant-ghost text-sm">
                                        Forgot your Password?
                                    </Link>
                                </Button>
                            </div>
                            <Input
                                type="password"
                                required
                                name="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button className="w-full" loading={loading}>
                            Sign In
                        </Button>
                    </div>
                </div>

                <div className="bg-muted rounded-lg border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Don&apos;t have an account?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}