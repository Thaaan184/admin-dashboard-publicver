'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import AlertModal from '../../../components/AlertModal';

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();
        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            username: data.username || '',
            name: data.name || '',
            role: data.role || 'operator',
          }));
        } else {
          setAlertModal({
            isOpen: true,
            message: data.message || 'Gagal mengambil data user.',
            type: 'error',
          });
        }
      } catch {
        setAlertModal({
          isOpen: true,
          message: 'Terjadi kesalahan saat mengambil data user.',
          type: 'error',
        });
      }
    };
    if (id) fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword, ...rest } = formData;

    if (password && password !== confirmPassword) {
      return setAlertModal({
        isOpen: true,
        message: 'Password dan konfirmasi tidak cocok.',
        type: 'error',
      });
    }

    const payload = password ? { ...rest, password } : rest;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setAlertModal({
        isOpen: true,
        message: data.message || (response.ok ? 'User updated successfully.' : 'Failed to update user.'),
        type: response.ok ? 'success' : 'error',
      });
    } catch {
      setAlertModal({
        isOpen: true,
        message: 'Terjadi kesalahan saat memperbarui user.',
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
        <title>Edit User - Your Brand</title>
      </Head>
      <div className="container mt-5" style={{ maxWidth: '700px' }}>
        <h2><i className="bi bi-person-gear me-2"></i>Edit User</h2>
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
            <label htmlFor="password" className="form-label">New Password (optional)</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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

          <button type="submit" className="btn btn-primary">Update User</button>
        </form>

        <AlertModal {...alertModal} onClose={handleAlertClose} />
      </div>
    </>
  );
}
