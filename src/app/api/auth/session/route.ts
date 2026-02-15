import { NextRequest } from 'next/server';
import { successResponse, unauthorizedError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    // For future implementation with proper session management
    // Currently using localStorage on client-side
    
    // This is a placeholder for future JWT/session-based auth
    return unauthorizedError('Session management not yet implemented');
}
