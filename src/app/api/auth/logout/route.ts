import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    // For future implementation with proper session management
    // Currently using localStorage on client-side
    
    return successResponse(
        { message: 'Logged out successfully' },
        'Logout berhasil'
    );
}
