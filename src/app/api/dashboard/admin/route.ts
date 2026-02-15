import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api/dashboard/admin
 * Get admin dashboard statistics
 */
export async function GET(request: NextRequest) {
    try {
        // Get total santri count
        const { count: totalSantri, error: santriError } = await supabaseServer
            .from('santri')
            .select('*', { count: 'exact', head: true });

        if (santriError) {
            console.error('Error counting santri:', santriError);
        }

        // Get current month/year
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Get current month's tagihan batch
        const { data: currentBatch } = await supabaseServer
            .from('tagihan_batch')
            .select('id, total')
            .eq('bulan', currentMonth)
            .eq('tahun', currentYear)
            .single();

        // Get payment statistics for current month
        let totalTagihanBulanIni = 0;
        let totalPembayaranBulanIni = 0;
        let totalTunggakan = 0;

        if (currentBatch) {
            const { data: payments } = await supabaseServer
                .from('pembayaran')
                .select('total_tagihan, dibayarkan')
                .eq('tagihan_batch_id', currentBatch.id);

            if (payments) {
                totalTagihanBulanIni = payments.reduce((sum, p) => sum + (p.total_tagihan || 0), 0);
                totalPembayaranBulanIni = payments.reduce((sum, p) => sum + (p.dibayarkan || 0), 0);
                totalTunggakan = totalTagihanBulanIni - totalPembayaranBulanIni;
            }
        }

        // Get all-time tunggakan
        const { data: allPayments } = await supabaseServer
            .from('pembayaran')
            .select('total_tagihan, dibayarkan');

        let totalTunggakanKeseluruhan = 0;
        if (allPayments) {
            totalTunggakanKeseluruhan = allPayments.reduce(
                (sum, p) => sum + ((p.total_tagihan || 0) - (p.dibayarkan || 0)),
                0
            );
        }

        return successResponse({
            totalSantri: totalSantri || 0,
            bulanIni: {
                bulan: currentMonth,
                tahun: currentYear,
                totalTagihan: totalTagihanBulanIni,
                totalPembayaran: totalPembayaranBulanIni,
                tunggakan: totalTunggakan,
            },
            totalTunggakanKeseluruhan,
        });
    } catch (error: any) {
        console.error('Dashboard admin GET error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
