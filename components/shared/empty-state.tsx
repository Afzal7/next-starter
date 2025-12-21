"use client";

import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
	icon: ComponentType<Record<string, unknown>>;
	title: string;
	description: string;
	size?: "sm" | "md" | "lg";
	variant?: "card" | "inline";
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	size = "md",
	variant = "card",
	action,
	className,
}: EmptyStateProps) {
	const sizeClasses = {
		sm: {
			container: "p-6",
			icon: "w-12 h-12",
			iconInner: "h-6 w-6",
			title: "text-base",
			description: "text-sm",
		},
		md: {
			container: "p-12",
			icon: "w-16 h-16",
			iconInner: "h-8 w-8",
			title: "text-lg",
			description: "text-base",
		},
		lg: {
			container: "p-16",
			icon: "w-20 h-20",
			iconInner: "h-10 w-10",
			title: "text-xl",
			description: "text-lg",
		},
	};

	const classes = sizeClasses[size];

	if (variant === "inline") {
		return (
			<div className={`text-center space-y-4 ${className || ""}`}>
				<div className={`${classes.icon} bg-muted rounded-full flex items-center justify-center mx-auto`}>
					<Icon className={`${classes.iconInner} text-muted-foreground`} />
				</div>
				<div>
					<h3 className={`${classes.title} font-semibold mb-2`}>{title}</h3>
					<p className={`text-muted-foreground mb-4`}>{description}</p>
					{action && (
						<Button onClick={action.onClick}>
							{action.label}
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<Card className={`shadow-sm ${className || ""}`}>
			<CardContent className={`${classes.container} text-center space-y-4`}>
				<div className={`${classes.icon} bg-muted rounded-full flex items-center justify-center mx-auto`}>
					<Icon className={`${classes.iconInner} text-muted-foreground`} />
				</div>
				<div>
					<h3 className={`${classes.title} font-semibold mb-2`}>{title}</h3>
					<p className={`text-muted-foreground mb-6`}>{description}</p>
					{action && (
						<Button onClick={action.onClick}>
							{action.label}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
