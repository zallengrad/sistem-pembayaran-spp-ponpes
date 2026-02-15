import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { successResponse, errorResponse, validationError } from '@/lib/api-response';

/**
 * GET /api/pembayaran
 * List all payments with optional filters
 * Query params: ?santriId=X&tahun=2026
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const santriId = searchParams.get('santriId');
        const tahun = searchParams.get('tahun');

        let query = supabaseServer
            .from('pembayaran')
            .select(`
                id,
                santri_id,
                total_tagihan,
                dibayarkan,
                created_at,
                santri (
                    id,
                    nis,
                    nama,
                    kelas
                ),
                tagihan_batch (
                    id,
                    bulan,
                    tahun,
                    total
                )
            `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (santriId) {
            query = query.eq('santri_id', parseInt(santriId));
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching pembayaran:', error);
            return errorResponse('Gagal mengambil data pembayaran', 500);
        }

        // Filter by year if provided (client-side filter since it's in related table)
        let filteredData = data || [];
        if (tahun && tahun !== 'all') {
            filteredData = filteredData.filter((p: any) => 
                p.tagihan_batch?.tahun === parseInt(tahun)
            );
        }

        return successResponse(filteredData);
    } catch (error: any) {
        console.error('Pembayaran GET error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

/**
 * POST /api/pembayaran
 * Process a payment (update dibayarkan amount)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { pembayaranId, jumlah } = body;

        // Validation
        if (!pembayaranId || jumlah === undefined) {
            return validationError('pembayaranId dan jumlah harus diisi');
        }

        const jumlahBayar = parseFloat(jumlah);
        if (jumlahBayar < 0) {
            return validationError('Jumlah pembayaran tidak boleh negatif');
        }

        // Get current pembayaran record
        const { data: pembayaran, error: fetchError } = await supabaseServer
            .from('pembayaran')
            .select('*')
            .eq('id', pembayaranId)
            .single();

        if (fetchError || !pembayaran) {
            return errorResponse('Data pembayaran tidak ditemukan', 404);
        }

        // Calculate new total dibayarkan
        const newDibayarkan = (pembayaran.dibayarkan || 0) + jumlahBayar;

        // Validate tidak melebihi total tagihan
        if (newDibayarkan > pembayaran.total_tagihan) {
            return validationError(
                `Jumlah pembayaran melebihi total tagihan. Sisa: ${pembayaran.total_tagihan - pembayaran.dibayarkan}`
            );
        }

        // Update pembayaran
        const { data, error } = await supabaseServer
            .from('pembayaran')
            .update({ dibayarkan: newDibayarkan })
            .eq('id', pembayaranId)
            .select()
            .single();

        if (error) {
            console.error('Error updating pembayaran:', error);
            return errorResponse('Gagal memproses pembayaran', 500);
        }

        return successResponse(
            data,
            `Pembayaran berhasil diproses. Total dibayarkan: ${newDibayarkan}`,
            200
        );
    } catch (error: any) {
        console.error('Pembayaran POST error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
