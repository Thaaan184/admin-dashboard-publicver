'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');

  // Check login status, set username, and set user role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('userData');
      
      // If not logged in and not on login page, redirect to login
      if (!token && pathname !== '/login') {
        router.push('/login');
      } else if (userData) {
        const parsedData = JSON.parse(userData);
        setUsername(parsedData.name || '');
        setUserRole(parsedData.role || '');
      }
    }
  }, [pathname, router]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userData');
    router.push('/login');
    setIsSidebarOpen(false);
  };

  const handleGoHome = () => {
    router.push('/');
    setIsSidebarOpen(false);
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      <nav
        style={{
          width: '100%',
          backgroundColor: 'var(--primary-color)',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        <div
          onClick={handleGoHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <img
            src="/Logo-Kemhan.png"
            alt="Kemhan Logo"
            style={{ height: '50px', marginRight: '10px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px',
                lineHeight: '1.2',
              }}
            >
              Dashboard Manajemen Perangkat AR & 3D
            </span>
            <span
              style={{
                color: 'var(--secondary-color)',
                fontSize: '14px',
                lineHeight: '1.2',
              }}
            >
              Pusat Data dan Informasi KEMHAN
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '10px',
            }}
          >
            <img
              src="/MenuSideBar.svg"
              alt="Menu"
              style={{ height: '24px', width: '24px' }}
            />
          </button>
        </div>
      </nav>

      {isSidebarOpen && (
        <div
          ref={sidebarRef}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100%',
            width: '250px',
            backgroundColor: '#8B4513',
            backdropFilter: 'blur(10px)',
            boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.2)',
            zIndex: 1001, // Increased z-index to be above the footer
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => handleNavigation('/profile')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '10px',
              }}
            >
              <img
                src="/user.svg"
                alt="Profile"
                style={{ height: '24px', width: '24px' }}
              />
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '10px',
              }}
            >
              <img
                src="/Close.svg"
                alt="Close"
                style={{ height: '24px', width: '24px' }}
              />
            </button>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              onClick={() => handleNavigation('/')}
              className="sidebar-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '10px',
                fontSize: '16px',
                color: 'var(--foreground)',
                transition: 'background-color 0.2s ease',
              }}
            >
              <img
                src="/DashboardUtama.svg"
                alt="Dashboard"
                style={{ height: '20px', width: '20px', marginRight: '10px' }}
              />
              Dashboard Perangkat
            </button>

            <button
              onClick={() => handleNavigation('/tentang-Your Brand')}
              className="sidebar-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '10px',
                fontSize: '16px',
                color: 'var(--foreground)',
                transition: 'background-color 0.2s ease',
              }}
            >
              <img
                src="/info.svg"
                alt="Tentang"
                style={{ height: '20px', width: '20px', marginRight: '10px' }}
              />
              Tentang Your Brand
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => handleNavigation('/user')}
                className="sidebar-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                  fontSize: '16px',
                  color: 'var(--foreground)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <img
                  src="/table.svg"
                  alt="Manajemen Pengguna"
                  style={{ height: '20px', width: '20px', marginRight: '10px' }}
                />
                Manajemen User
              </button>
            )}

            <button
              onClick={handleLogout}
              className="sidebar-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '10px',
                fontSize: '16px',
                color: 'var(--foreground)',
                transition: 'background-color 0.2s ease',
              }}
            >
              <img
                src="/logout.svg"
                alt="Logout"
                style={{ height: '20px', width: '24px', marginRight: '10px' }}
              />
              Logout
            </button>
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: '20px 10px',
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--foreground)',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            {username || 'Guest'}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .sidebar-item:hover {
          background-color: #f5f5f5;
          border-radius: 6px;
        }

        @media (max-width: 768px) {
          nav {
            padding: 8px 12px;
            display: flex;
            flex-direction: row;
            justifyContent: 'space-between',
            alignItems: 'center',
          }
          nav > div:first-child {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
          }
          nav img {
            height: 36px;
            margin-right: 10px;
            flex-shrink: 0;
          }
          nav span:first-child {
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          nav span:last-child {
            font-size: 11px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .sidebar-item {
            font-size: 14px;
            padding: 8px;
          }
          .sidebar-item img {
            height: 18px;
            width: 18px;
          }
          div[ref='sidebarRef'] {
            width: 200px;
            padding: 15px;
          }
          div[style*='marginTop: auto'] {
            fontSize: 12px;
            padding: 15px 8px;
          }
        }

        @media (max-width: 480px) {
          nav {
            padding: 6px 10px;
          }
          nav > div:first-child {
            flex: 1;
            min-width: 0;
          }
          nav img {
            height: 32px;
            margin-right: 8px;
          }
          nav span:first-child {
            font-size: 12px;
          }
          nav span:last-child {
            font-size: 10px;
          }
          .sidebar-item {
            font-size: 13px;
            padding: 6px;
          }
          .sidebar-item img {
            height: 16px;
            width: 16px;
          }
          div[ref='sidebarRef'] {
            width: 180px;
            padding: 12px;
          }
          div[style*='marginTop: auto'] {
            fontSize: 11px;
            padding: 12px 6px;
          }
        }
      `}</style>
    </>
  );
}