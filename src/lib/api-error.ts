/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends ApiError {
    constructor(message: string) {
        super(message, 400);
    }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApiError {
    constructor(message: string) {
        super(message, 409);
    }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends ApiError {
    constructor(message: string = 'Internal server error') {
        super(message, 500);
    }
}
