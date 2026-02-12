"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./wali.module.css";

interface PaymentRecord {
    id: string;
    bulan: number;
    tahun: number;
    totalTagihan: number;
    dibayarkan: number;
}

interface SantriProfile {
    id: string;
    nis: string;
    nama: string;
    kelas: string;
    nama_wali: string;
}

export default function WaliPage() {
    const router = useRouter();
    const [santri, setSantri] = useState<SantriProfile | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>("all");
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const santriId = localStorage.getItem('user_wali_santri_id');
            if (!santriId) {
                router.push('/login');
                return;
            }

            try {
                // 1. Fetch Santri Profile
                const { data: santriData, error: santriError } = await supabase
                    .from('santri')
                    .select('id, nis, nama, kelas, nama_wali')
                    .eq('id', santriId)
                    .single();
                
                if (santriError || !santriData) {
                    console.error("Santri not found", santriError);
                    router.push('/login');
                    return;
                }
                setSantri(santriData);

                // 2. Fetch Payments
                const { data: paymentData, error: paymentError } = await supabase
                    .from('pembayaran')
                    .select(`
                        id,
                        dibayarkan,
                        tagihan_batch (
                            bulan,
                            tahun,
                            total
                        )
                    `)
                    .eq('santri_id', santriId);

                if (paymentError) {
                    console.error("Error fetching payments", paymentError);
                } else if (paymentData) {
                    const mappedPayments: PaymentRecord[] = paymentData.map((item: any) => ({
                        id: item.id,
                        bulan: item.tagihan_batch.bulan,
                        tahun: item.tagihan_batch.tahun,
                        totalTagihan: item.tagihan_batch.total,
                        dibayarkan: item.dibayarkan
                    }));
                    
                    // Set default filter to current year if exists, else 'all'
                    const currentYear = new Date().getFullYear();
                    const hasCurrentYear = mappedPayments.some(p => p.tahun === currentYear);
                    setFilterTahun(hasCurrentYear ? String(currentYear) : "all");
                    
                    setPayments(mappedPayments);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetch();
    }, [router]);

    const handleLogout = () => {
        if (confirm("Apakah Anda yakin ingin keluar?")) {
            localStorage.removeItem('user_wali_santri_id');
            router.push("/login");
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!santri) return null;

    const availableYears = [...new Set(payments.map((p) => p.tahun))].sort((a, b) => b - a);

    const filteredData = payments
        .filter((p) => filterTahun === "all" || p.tahun === Number(filterTahun))
        .sort((a, b) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
        });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getMonthName = (month: number) => {
        return new Date(0, month - 1).toLocaleString("id-ID", { month: "long" });
    };

    const getStatus = (rec: PaymentRecord) => {
        if (rec.dibayarkan >= rec.totalTagihan) return "Lunas";
        if (rec.dibayarkan > 0) return "Cicilan";
        return "Belum Lunas";
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Lunas": return styles.badgeLunas;
            case "Cicilan": return styles.badgeCicilan;
            default: return styles.badgeBelumLunas;
        }
    };

    // Summary calculations
    const totalTagihan = filteredData.reduce((sum, p) => sum + p.totalTagihan, 0);
    const totalDibayar = filteredData.reduce((sum, p) => sum + p.dibayarkan, 0);
    const totalSisa = totalTagihan - totalDibayar;

    return (
        <div className={styles.layoutContainer}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navBrand}>
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        style={{ borderRadius: "50%" }}
                    />
                    <div>
                        <div className={styles.navTitle}>PP Inayatullah</div>
                        <div className={styles.navSubtitle}>Portal Wali Santri</div>
                    </div>
                </div>
                <div className={styles.navUser}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>{santri.nama_wali}</span>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            backgroundColor: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            color: '#EF4444',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            marginLeft: '8px',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className={styles.mainContent} ref={printRef}>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.greeting}>Assalamu&apos;alaikum, {santri.nama_wali} 👋</h1>
                        <p className={styles.subtitle}>Laporan pembayaran untuk: <strong>{santri.nama}</strong> &bull; NIS: {santri.nis} &bull; Kelas: {santri.kelas}</p>
                    </div>
                    <button className={styles.btnExport} onClick={handleExportPDF}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export PDF
                    </button>
                </div>

                {/* Summary Cards */}
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Total Tagihan</div>
                        <div className={styles.summaryValue}>{formatCurrency(totalTagihan)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Sudah Dibayar</div>
                        <div className={`${styles.summaryValue} ${styles.summaryValueGreen}`}>{formatCurrency(totalDibayar)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Sisa Tagihan</div>
                        <div className={`${styles.summaryValue} ${totalSisa > 0 ? styles.summaryValueRed : styles.summaryValueGreen}`}>{formatCurrency(totalSisa)}</div>
                    </div>
                </div>

                {/* Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableTitle}>
                        Riwayat Pembayaran
                        <select
                            value={filterTahun}
                            onChange={(e) => setFilterTahun(e.target.value)}
                            className={styles.yearFilter}
                        >
                            <option value="all">Semua Tahun</option>
                            {availableYears.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Bulan</th>
                                <th>Total Tagihan</th>
                                <th>Dibayarkan</th>
                                <th>Sisa</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((rec, index) => {
                                const status = getStatus(rec);
                                const sisa = rec.totalTagihan - rec.dibayarkan;
                                return (
                                    <tr key={rec.id}>
                                        <td>{index + 1}</td>
                                        <td>{getMonthName(rec.bulan)} {rec.tahun}</td>
                                        <td>{formatCurrency(rec.totalTagihan)}</td>
                                        <td>
                                            <span className={styles.amountPaid}>
                                                {formatCurrency(rec.dibayarkan)}
                                            </span>
                                        </td>
                                        <td>
                                            {sisa > 0 ? formatCurrency(sisa) : "-"}
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${getStatusStyle(status)}`}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    &copy; {new Date().getFullYear()} Pondok Pesantren Inayatullah. Semua hak dilindungi.
                </div>
            </main>
        </div>
    );
}
