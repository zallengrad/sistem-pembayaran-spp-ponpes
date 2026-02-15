import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { successResponse, errorResponse, notFoundError, validationError } from '@/lib/api-response';

/**
 * GET /api/santri/[id]
 * Get student detail by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data, error } = await supabaseServer
            .from('santri')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return notFoundError('Santri tidak ditemukan');
        }

        return successResponse(data);
    } catch (error: any) {
        console.error('Santri GET by ID error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

/**
 * PUT /api/santri/[id]
 * Update student by ID
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { nis, nama, kelas, nama_wali, password } = body;

        // Validation
        if (!nama || !kelas) {
            return validationError('Nama dan kelas harus diisi');
        }

        // Check if santri exists
        const { data: existing } = await supabaseServer
            .from('santri')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return notFoundError('Santri tidak ditemukan');
        }

        // If NIS is being updated, check for duplicates
        if (nis) {
            const { data: duplicate } = await supabaseServer
                .from('santri')
                .select('id')
                .eq('nis', nis)
                .neq('id', id)
                .single();

            if (duplicate) {
                return errorResponse('NIS sudah digunakan oleh santri lain', 409);
            }
        }

        // Update santri
        const updateData: any = { nama, kelas };
        if (nis) updateData.nis = nis;
        if (nama_wali !== undefined) updateData.nama_wali = nama_wali;
        if (password) updateData.password = password;

        const { data, error } = await supabaseServer
            .from('santri')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating santri:', error);
            return errorResponse('Gagal mengupdate data santri', 500);
        }

        return successResponse(data, 'Data santri berhasil diupdate');
    } catch (error: any) {
        console.error('Santri PUT error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

/**
 * DELETE /api/santri/[id]
 * Delete student by ID
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if santri exists
        const { data: existing } = await supabaseServer
            .from('santri')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return notFoundError('Santri tidak ditemukan');
        }

        // Delete santri (this will cascade delete related pembayaran records if FK is set)
        const { error } = await supabaseServer
            .from('santri')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting santri:', error);
            return errorResponse('Gagal menghapus data santri', 500);
        }

        return successResponse({ id }, 'Santri berhasil dihapus');
    } catch (error: any) {
        console.error('Santri DELETE error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
