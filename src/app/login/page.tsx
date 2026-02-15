"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (!result.success) {
                setError(result.error || 'Login gagal');
                return;
            }

            // Store user data based on role
            const { role, userId, redirectTo } = result.data;

            if (role === 'santri') {
                localStorage.setItem('user_santri_id', userId);
            } else if (role === 'wali') {
                localStorage.setItem('user_wali_santri_id', userId);
            }

            // Redirect to appropriate page
            router.push(redirectTo);

        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Left Panel - Background Image */}
            <div className={styles.leftPanel}>
                <Image
                    src="/images/background.png"
                    alt="Pondok Pesantren Inayatullah"
                    fill
                    priority
                    className={styles.backgroundImage}
                />
                <div className={styles.overlay} />
            </div>

            {/* Right Panel - Login Form */}
            <div className={styles.rightPanel}>
                <div className={styles.formWrapper}>
                    {/* Logo */}
                    <div className={styles.logoSection}>
                        <Image
                            src="/images/logo.png"
                            alt="Logo Pondok Pesantren Inayatullah"
                            width={150}
                            height={150}
                            priority
                            className={styles.logo}
                        />
                        <h1 className={styles.title}>
                            PONDOK PESANTREN
                            <br />
                            INAYATULLAH
                        </h1>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Error Message */}
                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        {/* Username Field */}
                        <div className={styles.fieldGroup}>
                            <label htmlFor="username" className={styles.label}>
                                Username
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={styles.input}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className={styles.fieldGroup}>
                            <label htmlFor="password" className={styles.label}>
                                Password
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button type="submit" className={styles.loginButton}>
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
