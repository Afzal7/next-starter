"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
	type: "list" | "card" | "form" | "profile" | "page" | "button";
	count?: number;
	className?: string;
}

export function LoadingSkeleton({
	type,
	count = 3,
	className,
}: LoadingSkeletonProps) {
	if (type === "list") {
		return (
			<div className={className || "grid gap-4 md:grid-cols-2 lg:grid-cols-3"}>
				{Array.from({ length: count }).map((_, i) => (
					<Card
						key={`skeleton-list-${
							// biome-ignore lint/suspicious/noArrayIndexKey: no other option
							i
						}`}
						className="shadow-sm"
					>
						<CardHeader>
							<Skeleton className="h-5 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-4 w-full mb-2" />
							<Skeleton className="h-4 w-2/3" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (type === "card") {
		return (
			<div className={className || "space-y-6"}>
				<div className="grid gap-4 md:grid-cols-2">
					<Card key="skeleton-card-1">
						<CardHeader>
							<Skeleton className="h-6 w-48" />
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Skeleton className="h-4 w-12 mb-2" />
								<Skeleton className="h-5 w-32" />
							</div>
							<div>
								<Skeleton className="h-4 w-12 mb-2" />
								<Skeleton className="h-5 w-24" />
							</div>
							<div>
								<Skeleton className="h-4 w-12 mb-2" />
								<Skeleton className="h-5 w-20" />
							</div>
							<div>
								<Skeleton className="h-4 w-12 mb-2" />
								<Skeleton className="h-5 w-full" />
							</div>
						</CardContent>
					</Card>

					<Card key="skeleton-card-2">
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-8" />
							</div>
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-8" />
							</div>
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-20" />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (type === "form") {
		return (
			<div className={className || "space-y-6"}>
				<Card>
					<CardHeader>
						<Skeleton className="h-10 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-50" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (type === "profile") {
		return (
			<div className={className || "space-y-6"}>
				<div className="flex items-center gap-4">
					<Skeleton className="h-20 w-20 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
				<Card>
					<CardHeader>
						<Skeleton className="h-5 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<Skeleton className="h-5 w-32" />
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="text-center">
								<Skeleton className="h-8 w-8 mx-auto mb-2" />
								<Skeleton className="h-4 w-16 mx-auto" />
							</div>
							<div className="text-center">
								<Skeleton className="h-8 w-8 mx-auto mb-2" />
								<Skeleton className="h-4 w-16 mx-auto" />
							</div>
							<div className="text-center">
								<Skeleton className="h-8 w-8 mx-auto mb-2" />
								<Skeleton className="h-4 w-16 mx-auto" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (type === "page") {
		return (
			<div className={className || "space-y-6"}>
				{/* Header skeleton */}
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
				{/* Content grid */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: count }).map((_, i) => (
						<Card key={`skeleton-page-${i}`}>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (type === "button") {
		return <Skeleton className={className || "h-10 w-32"} />;
	}

	return null;
}
