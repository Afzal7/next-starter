"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
	message: string;
	type?: "inline" | "page" | "toast";
	onRetry?: () => void;
	retryLabel?: string;
	className?: string;
}

export function ErrorState({
	message,
	type = "inline",
	onRetry,
	retryLabel = "Try again",
	className,
}: ErrorStateProps) {
	if (type === "page") {
		return (
			<div className={`flex flex-col items-center justify-center min-h-[400px] text-center p-8 ${className || ""}`}>
				<AlertCircle className="h-12 w-12 text-destructive mb-4" />
				<h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
				<p className="text-muted-foreground mb-4 max-w-md">{message}</p>
				{onRetry && (
					<Button onClick={onRetry}>
						<RefreshCw className="h-4 w-4 mr-2" />
						{retryLabel}
					</Button>
				)}
			</div>
		);
	}

	if (type === "toast") {
		return (
			<div className={`flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg ${className || ""}`}>
				<AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
				<div className="flex-1">
					<p className="text-sm font-medium text-destructive">{message}</p>
					{onRetry && (
						<Button
							variant="outline"
							size="sm"
							onClick={onRetry}
							className="mt-2"
						>
							<RefreshCw className="h-3 w-3 mr-1" />
							{retryLabel}
						</Button>
					)}
				</div>
			</div>
		);
	}

	// Default inline
	return (
		<Alert variant="destructive" className={className}>
			<AlertCircle className="h-4 w-4" />
			<AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<span>{message}</span>
				{onRetry && (
					<Button
						variant="outline"
						size="sm"
						onClick={onRetry}
						className="self-start sm:self-auto"
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						{retryLabel}
					</Button>
				)}
			</AlertDescription>
		</Alert>
	);
}
