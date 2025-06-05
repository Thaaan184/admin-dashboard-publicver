'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoLogout() {
  const router = useRouter();

  const INACTIVITY_LIMIT =30 * 60 * 1000; // 30 menit dalam milidetik

  let inactivityTimer = null;

  // Fungsi untuk mereset timer
  const resetTimer = () => {
    clearTimeout(inactivityTimer);

    // Set timer untuk logout setelah 30 menit
    inactivityTimer = setTimeout(() => {
      localStorage.removeItem('adminToken');
      router.push('/login');
    }, INACTIVITY_LIMIT);
  };

  // Event listener untuk aktivitas pengguna
  useEffect(() => {
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    // Tambahkan event listener
    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Mulai timer saat komponen dimuat
    resetTimer();

    // Bersihkan saat komponen di-unmount
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimeout(inactivityTimer);
    };
  }, [router]);

  return null; // Tidak merender apa pun
}