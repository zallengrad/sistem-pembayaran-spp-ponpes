"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./user.module.css";

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
}

export default function UserPage() {
    const router = useRouter();
    const [santri, setSantri] = useState<SantriProfile | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>("all");

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const santriId = localStorage.getItem('user_santri_id');
            if (!santriId) {
                router.push('/login');
                return;
            }

            try {
                // Fetch santri profile and payment data from API
                const response = await fetch(`/api/pembayaran/santri/${santriId}`);
                const result = await response.json();

                if (!result.success) {
                    console.error("Error fetching data", result.error);
                    router.push('/login');
                    return;
                }

                const { santri: santriData, payments: paymentData } = result.data;
                setSantri(santriData);

                // Map payment data to match expected format
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
            } catch (err) {
                console.error(err);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetch();
    }, [router]);

    const handleLogout = () => {
        if (confirm("Apakah Anda yakin ingin keluar?")) {
            localStorage.removeItem('user_santri_id');
            router.push("/login");
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!santri) return null;

    const availableYears = [...new Set(payments.map((p) => p.tahun))].sort((a, b) => b - a);

    const filteredData = payments
        .filter((p) => filterTahun === "all" || p.tahun === Number(filterTahun))
        .sort((a, b) => {
             if (a.tahun !== b.tahun) return b.tahun - a.tahun;
             return b.bulan - a.bulan; // Sort descending month
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
                        <div className={styles.navSubtitle}>Portal Santri</div>
                    </div>
                </div>
                <div className={styles.navUser}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>{santri.nama}</span>
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
            <main className={styles.mainContent}>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.greeting}>Assalamu&apos;alaikum, {santri.nama} 👋</h1>
                    <p className={styles.subtitle}>NIS: {santri.nis} &bull; Kelas: {santri.kelas}</p>
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
                            style={{
                                float: "right",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid #D1D5DB",
                                fontSize: "13px",
                                color: "#374151",
                                backgroundColor: "#F9FAFB",
                                cursor: "pointer",
                                outline: "none",
                            }}
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
