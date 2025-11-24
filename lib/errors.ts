/**
 * Error handling utilities for consistent error responses
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  includeStack: boolean = false
): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code,
          ...(includeStack && { stack: error.stack }),
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected errors
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return Response.json(
    {
      error: {
        message,
        code: "INTERNAL_SERVER_ERROR",
        ...(includeStack &&
          error instanceof Error && { stack: error.stack }),
      },
    },
    { status: 500 }
  );
}

/**
 * Logs errors with context
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error("[ERROR]", {
    message: errorMessage,
    stack: errorStack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

