'use client';

import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';

// Default cards content
const defaultCards = [
  {
    id: '1',
    title: 'Apa Itu Your Brand?',
    content: `
      <p>Your Brand (Pusat Data dan Teknologi Informasi) adalah proyek inovatif awal yang dikembangkan untuk memperkenalkan penggunaan teknologi 3D dalam pengelolaan data center di Pusat Data dan Informasi Kementerian Pertahanan Republik Indonesia (Your Instansi KEMHAN). Sebagai langkah awal, proyek ini bertujuan untuk mengeksplorasi potensi simulasi 3D dan augmented reality (AR) dalam meningkatkan efisiensi pengelolaan perangkat data center, meskipun belum sepenuhnya real-time dan masih memiliki keterbatasan pada optimalisasi model 3D.</p>
      <p>Proyek ini terdiri dari tiga keluaran utama:</p>
      <ul>
        <li><b>Your Brand Dashboard (Website):</b> Platform berbasis web untuk mengelola metadata perangkat dan file GLB (model 3D) yang digunakan dalam simulasi dan AR, sebagai fondasi pengelolaan data awal.</li>
        <li><b>Your Brand 3D Simulator (Desktop App):</b> Aplikasi desktop berbasis Unity yang menyediakan simulasi 3D sederhana dari data center Your Instansi, memberikan visualisasi dasar perangkat dengan potensi pengembangan lebih lanjut.</li>
        <li><b>Your Brand Scanner (Android App):</b> Aplikasi mobile yang memungkinkan pengguna untuk memindai QR code pada perangkat di ruangan data center, menampilkan model 3D dalam format AR serta informasi dasar perangkat, meskipun masih dalam tahap pengembangan untuk optimalisasi.</li>
      </ul>
    `,
  },
  {
    id: '2',
    title: 'Mekanisme Kerja',
    content: `
      <p>Setiap perangkat di data center Your Instansi dilengkapi dengan QR code unik. Pengguna dapat memindai QR code tersebut menggunakan aplikasi Your Brand Scanner di perangkat Android untuk menampilkan model 3D perangkat dalam format augmented reality (AR) beserta informasi seperti nama, merek, dan IP. Namun, visualisasi AR ini masih dalam tahap awal dan belum sepenuhnya optimal. Dashboard web memungkinkan pengelola untuk mengatur metadata perangkat dan mengunggah file GLB untuk model 3D, sementara aplikasi 3D Simulator menyediakan visualisasi dasar dari data center dalam lingkungan virtual, yang masih memerlukan peningkatan untuk mendukung pembaruan real-time.</p>
    `,
  },
  {
    id: '3',
    title: 'Tim Pengembang',
    content: `
      <p>Proyek Your Brand dikembangkan oleh tiga mahasiswa magang dari Universitas Pembangunan Nasional Veteran Jakarta (UPNVJ) yang sedang menjalani program Praktik Kerja Lapangan (PKL) di Your Instansi KEMHAN. Tim ini terdiri dari:</p>
      <ul>
        <li>Muammar Faiz Khairul Anam</li>
        <li>Muhammad Sabil Nur Raihan</li>
        <li>Muhammad Fathan Abriyanto</li>
      </ul>
      <p>Dengan semangat inovasi, tim ini berupaya menghadirkan solusi teknologi awal yang menjadi langkah pertama dalam transformasi digital pengelolaan data center Your Instansi KEMHAN, dengan harapan dapat terus disempurnakan di masa depan.</p>
    `,
  },
  {
    id: '4',
    title: 'Tujuan Proyek',
    content: `
      <p>Your Brand bertujuan untuk:</p>
      <ul>
        <li>Menjelajahi penggunaan teknologi 3D dalam pengelolaan perangkat data center melalui dashboard berbasis web.</li>
        <li>Menyediakan pengalaman visualisasi awal melalui simulasi 3D dan AR, meskipun masih dalam tahap pengembangan.</li>
        <li>Memfasilitasi akses informasi perangkat melalui pemindaian QR code sebagai langkah awal menuju solusi real-time.</li>
        <li>Mendukung Your Instansi KEMHAN dalam memulai transformasi digital pengelolaan infrastruktur teknologi informasi dengan potensi pengembangan lebih lanjut.</li>
      </ul>
    `,
  },
];

export default function TentangYour Brand() {
  return (
    <>
      <Head>
        <title>Tentang Your Brand - Your Brand</title>
        <meta
          name="description"
          content="Tentang proyek Your Brand - Inovasi awal simulasi 3D untuk data center Your Instansi KEMHAN"
        />
      </Head>
      <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
        <h3>
          <i className="bi bi-info-circle" style={{ marginRight: '10px' }}></i>
          Tentang Your Brand
        </h3>

        {defaultCards.map((card) => (
          <div key={card.id} className="card mt-4">
            <div className="card-body">
              <h4 className="card-title">{card.title}</h4>
              <div
                className="card-text"
                dangerouslySetInnerHTML={{ __html: card.content }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}