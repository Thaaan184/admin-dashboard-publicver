'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
    <footer
      style={{
        width: '100%',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        padding: '20px 0',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0 }}>
        Jl. RS. Fatmawati No. 1, Pondok Labu Cilandak, Jakarta Selatan
      </p>
      <p style={{ margin: 0 }}>Email: Your Instansi@kemhan.go.id</p>
      <p style={{ margin: 0 }}>
        <a
          href="https://www.kemhan.go.id/Your Instansi/"
          style={{ color: 'var(--secondary-color)' }}
        >
          Pusat Data dan Informasi Kemhan
        </a>
      </p>
    </footer>
  );
}