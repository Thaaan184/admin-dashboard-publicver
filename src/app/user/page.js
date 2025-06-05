'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import UserTable from '../components/UserTable';
import AlertModal from '../components/AlertModal';

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('userData');
      
      if (!adminToken || !userData) {
        router.push('/login');
        return;
      }

      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [router]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedUsers.length > 0) {
      try {
        const response = await fetch('/api/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedUsers }),
        });

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          data = {};
        }

        if (response.ok) {
          setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)));
          setSelectedUsers([]);
          setShowBulkDeleteModal(null);
          setAlertModal({
            isOpen: true,
            message: data.message || 'Selected users deleted successfully.',
            type: 'success',
          });
        } else {
          setAlertModal({
            isOpen: true,
            message: data.error || `Failed to delete users (Status: ${response.status}).`,
            type: 'error',
          });
        }
      } catch (error) {
        setAlertModal({
          isOpen: true,
          message: 'An unexpected error occurred while deleting users.',
          type: 'error',
        });
      }
    } else {
      setAlertModal({
        isOpen: true,
        message: 'Please select at least one user to delete.',
        type: 'error',
      });
    }
  }, [selectedUsers]);

  const handleAlertClose = useCallback(() => {
    setAlertModal({ isOpen: false, message: '', type: 'success' });
    if (alertModal.type === 'success') {
      window.location.reload();
    }
  }, [alertModal.type]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        } else {
          console.error('Failed to fetch users:', data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <>
      <Head>
        <title>User Management - Your Brand</title>
        <meta
          name="description"
          content="User management dashboard - Pusat Data dan Informasi Kemhan"
        />
      </Head>
      <div className="container" style={{ marginTop: '40px' }}>
        <h3>
          <i className="bi bi-table" style={{ marginRight: '10px' }}></i>
          Tabel Manajemen Pengguna
        </h3>
        <UserTable
          setUsers={setUsers}
          setSelectedUsers={setSelectedUsers}
          users={users}
          selectedUsers={selectedUsers}
          showBulkDeleteModal={showBulkDeleteModal}
          setShowBulkDeleteModal={setShowBulkDeleteModal}
          handleBulkDelete={handleBulkDelete}
        />
        <AlertModal
          isOpen={alertModal.isOpen}
          message={alertModal.message}
          type={alertModal.type}
          onClose={handleAlertClose}
        />
      </div>
    </>
  );
}