import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { successResponse, errorResponse, validationError } from '@/lib/api-response';

/**
 * GET /api/santri
 * List all students
 */
export async function GET(request: NextRequest) {
    try {
        const { data, error } = await supabaseServer
            .from('santri')
            .select('*')
            .order('nama', { ascending: true });

        if (error) {
            console.error('Error fetching santri:', error);
            return errorResponse('Gagal mengambil data santri', 500);
        }

        return successResponse(data || []);
    } catch (error: any) {
        console.error('Santri GET error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

/**
 * POST /api/santri
 * Create new student
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nis, nama, kelas, nama_wali, password } = body;

        // Validation
        if (!nis || !nama || !kelas) {
            return validationError('NIS, nama, dan kelas harus diisi');
        }

        // Check if NIS already exists
        const { data: existing } = await supabaseServer
            .from('santri')
            .select('id')
            .eq('nis', nis)
            .single();

        if (existing) {
            return errorResponse('NIS sudah terdaftar', 409);
        }

        // Insert new santri
        const { data, error } = await supabaseServer
            .from('santri')
            .insert([{
                nis,
                nama,
                kelas,
                nama_wali: nama_wali || null,
                password: password || nis, // Default password = NIS
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating santri:', error);
            return errorResponse('Gagal membuat data santri', 500);
        }

        return successResponse(data, 'Santri berhasil ditambahkan', 201);
    } catch (error: any) {
        console.error('Santri POST error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
