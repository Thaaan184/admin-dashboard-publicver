import './styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BulkActionProvider } from './components/BulkActionContext';
import AutoLogout from './components/AutoLogout';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Your Brand DASHBOARD</title>
        <link rel="icon" href="/Logo-Kemhan.png" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet"/>
      </head>
      <body>
        <BulkActionProvider>
          <Navbar />
          <AutoLogout />
          <main>{children}</main>
          <Footer />
        </BulkActionProvider>
        <Analytics />
      </body>
    </html>
  );
}