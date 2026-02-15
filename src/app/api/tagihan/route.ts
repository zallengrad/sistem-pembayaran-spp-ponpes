import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api/tagihan
 * List all billing batches with optional year filter
 * Query params: ?tahun=2026
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tahun = searchParams.get('tahun');

        let query = supabaseServer
            .from('tagihan_batch')
            .select('*')
            .order('tahun', { ascending: false })
            .order('bulan', { ascending: false });

        // Apply year filter if provided
        if (tahun && tahun !== 'all') {
            query = query.eq('tahun', parseInt(tahun));
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching tagihan:', error);
            return errorResponse('Gagal mengambil data tagihan', 500);
        }

        return successResponse(data || []);
    } catch (error: any) {
        console.error('Tagihan GET error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
