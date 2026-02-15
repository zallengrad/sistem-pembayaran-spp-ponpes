import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { successResponse, errorResponse, notFoundError } from '@/lib/api-response';

/**
 * GET /api/tagihan/santri/[santriId]
 * Get all billing batches for a specific student
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ santriId: string }> }
) {
    try {
        const { santriId } = await params;

        // Verify santri exists
        const { data: santri, error: santriError } = await supabaseServer
            .from('santri')
            .select('id')
            .eq('id', santriId)
            .single();

        if (santriError || !santri) {
            return notFoundError('Santri tidak ditemukan');
        }

        // Get all pembayaran records with tagihan_batch details
        const { data, error } = await supabaseServer
            .from('pembayaran')
            .select(`
                id,
                total_tagihan,
                dibayarkan,
                tagihan_batch (
                    id,
                    bulan,
                    tahun,
                    spp,
                    kebersihan,
                    konsumsi,
                    pembangunan,
                    total
                )
            `)
            .eq('santri_id', santriId)
            .order('tagihan_batch(tahun)', { ascending: false })
            .order('tagihan_batch(bulan)', { ascending: false });

        if (error) {
            console.error('Error fetching tagihan for santri:', error);
            return errorResponse('Gagal mengambil data tagihan', 500);
        }

        return successResponse(data || []);
    } catch (error: any) {
        console.error('Tagihan santri GET error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
