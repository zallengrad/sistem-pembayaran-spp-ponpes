import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, message?: string, status: number = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        message,
    }, { status });
}

/**
 * Create a standardized error response
 */
export function errorResponse(error: string, status: number = 400): NextResponse<ApiResponse> {
    return NextResponse.json({
        success: false,
        error,
    }, { status });
}

/**
 * Create a validation error response
 */
export function validationError(message: string): NextResponse<ApiResponse> {
    return errorResponse(message, 400);
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedError(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return errorResponse(message, 401);
}

/**
 * Create a not found error response
 */
export function notFoundError(message: string = 'Resource not found'): NextResponse<ApiResponse> {
    return errorResponse(message, 404);
}

/**
 * Create an internal server error response
 */
export function serverError(message: string = 'Internal server error'): NextResponse<ApiResponse> {
    return errorResponse(message, 500);
}
