import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { successResponse, errorResponse, notFoundError } from '@/lib/api-response';

/**
 * GET /api/pembayaran/santri/[santriId]
 * Get payment history for a specific student with full details
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
            .select('id, nis, nama, kelas, nama_wali')
            .eq('id', santriId)
            .single();

        if (santriError || !santri) {
            return notFoundError('Santri tidak ditemukan');
        }

        // Get all pembayaran records with full details
        const { data: payments, error: paymentsError } = await supabaseServer
            .from('pembayaran')
            .select(`
                id,
                total_tagihan,
                dibayarkan,
                created_at,
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
            .eq('santri_id', santriId);

        if (paymentsError) {
            console.error('Error fetching payments:', {
                error: paymentsError,
                message: paymentsError.message,
                details: paymentsError.details,
                hint: paymentsError.hint,
                code: paymentsError.code,
                santriId
            });
            return errorResponse(`Gagal mengambil data pembayaran: ${paymentsError.message}`, 500);
        }

        // Log untuk debugging
        console.log(`Fetched ${payments?.length || 0} payment records for santri ${santriId}`);

        return successResponse({
            santri,
            payments: payments || [],
        });
    } catch (error: any) {
        console.error('Pembayaran santri GET error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
