'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import AlertModal from '../../components/AlertModal';

export default function NewUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'operator',
  });

  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('userData');
    if (!adminToken || !userData) return router.push('/login');
    const parsedUserData = JSON.parse(userData);
    if (parsedUserData.role !== 'admin') router.push('/login');
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword, username, name, role } = formData;

    // Validasi input
    if (!username || !name || !password || !role) {
      return setAlertModal({
        isOpen: true,
        message: 'Semua field wajib diisi.',
        type: 'error',
      });
    }

    if (password !== confirmPassword) {
      return setAlertModal({
        isOpen: true,
        message: 'Password dan konfirmasi tidak cocok.',
        type: 'error',
      });
    }

    // Validasi role
    if (!['admin', 'operator'].includes(role)) {
      return setAlertModal({
        isOpen: true,
        message: 'Role tidak valid. Harus "admin" atau "operator".',
        type: 'error',
      });
    }

    // Cek apakah username sudah ada
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      if (users.some(user => user.username === username)) {
        return setAlertModal({
          isOpen: true,
          message: 'Username sudah digunakan.',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Error checking username:', err);
      return setAlertModal({
        isOpen: true,
        message: 'Gagal memeriksa username. Silakan coba lagi.',
        type: 'error',
      });
    }

    // Kirim request untuk membuat user baru
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, password, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        // Tangani error spesifik dari server
        setAlertModal({
          isOpen: true,
          message: data.error || 'Gagal membuat user.',
          type: 'error',
        });
      } else {
        setAlertModal({
          isOpen: true,
          message: 'User berhasil dibuat.',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setAlertModal({
        isOpen: true,
        message: 'Terjadi kesalahan saat membuat user.',
        type: 'error',
      });
    }
  };

  const handleAlertClose = () => {
    setAlertModal({ isOpen: false, message: '', type: 'success' });
    if (alertModal.type === 'success') router.push('/user');
  };

  return (
    <>
      <Head>
        <title>Add New User - Your Brand</title>
      </Head>
      <div className="container mt-5" style={{ maxWidth: '700px' }}>
        <h2><i className="bi bi-person-plus me-2"></i>Add New User</h2>
        <form onSubmit={handleSubmit}>
          {['username', 'name'].map(field => (
            <div className="mb-3" key={field}>
              <label htmlFor={field} className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type="text"
                className="form-control"
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              className="form-control"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">Create User</button>
        </form>

        <AlertModal {...alertModal} onClose={handleAlertClose} />
      </div>
    </>
  );
}