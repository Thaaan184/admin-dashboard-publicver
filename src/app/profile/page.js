'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import AlertModal from '../components/AlertModal';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('userData');
      if (!token || !userData) {
        router.push('/login');
      } else {
        try {
          const parsedData = JSON.parse(userData);
          if (!parsedData.id) {
            throw new Error('User ID missing in userData');
          }
          fetchUserProfile(parsedData.id);
        } catch (error) {
          console.error('Error parsing userData:', error);
          setAlertModal({
            isOpen: true,
            message: 'Invalid user data. Please log in again.',
            type: 'error',
          });
          router.push('/login');
        }
      }
    }
  }, [router]);

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/users/profile?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        setFormData({
          username: data.username || '',
          name: data.name || '',
          password: '',
          confirmPassword: '',
        });
      } else {
        setAlertModal({
          isOpen: true,
          message: data.error || 'Failed to fetch profile.',
          type: 'error',
        });
        router.push('/login');
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      setAlertModal({
        isOpen: true,
        message: 'An unexpected error occurred while fetching profile.',
        type: 'error',
      });
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (!user) {
      setAlertModal({
        isOpen: true,
        message: 'User data not loaded. Please try again.',
        type: 'error',
      });
      return;
    }
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        password: '',
        confirmPassword: '',
      });
    }
  };

  const handleUpdateProfile = useCallback(async () => {
    if (!user) {
      setAlertModal({
        isOpen: true,
        message: 'User data not loaded. Please try again.',
        type: 'error',
      });
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setAlertModal({
        isOpen: true,
        message: 'Passwords do not match.',
        type: 'error',
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      const updateData = {
        userId: userData.id,
        username: formData.username,
        name: formData.name,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
        setIsEditMode(false);
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        localStorage.setItem('userData', JSON.stringify({
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role,
        }));
        setAlertModal({
          isOpen: true,
          message: 'Profile updated successfully.',
          type: 'success',
        });
      } else {
        setAlertModal({
          isOpen: true,
          message: data.error || 'Failed to update profile.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setAlertModal({
        isOpen: true,
        message: 'An unexpected error occurred while updating profile.',
        type: 'error',
      });
    }
  }, [formData, user]);

  const handleAlertClose = useCallback(() => {
    setAlertModal({ isOpen: false, message: '', type: 'success' });
  }, []);

  if (isLoading) {
    return (
      <div className="container" style={{ marginTop: '40px', maxWidth: '600px', textAlign: 'center' }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ marginTop: '40px', maxWidth: '600px', textAlign: 'center' }}>
        <h3>Error loading profile</h3>
        <p>Please try logging in again.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - Your Brand</title>
        <meta
          name="description"
          content="User profile management - Pusat Data dan Informasi Kemhan"
        />
      </Head>
      <div className="container" style={{ marginTop: '40px', maxWidth: '600px' }}>
        <div className="profile-card">
          <h2 className="profile-title">
            <i className="bi bi-person-circle" style={{ marginRight: '8px' }}></i>
            Edit Profile
          </h2>
          <div className="profile-content">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <div className="input-wrapper">
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  readOnly={!isEditMode}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  readOnly={!isEditMode}
                />
              </div>
            </div>
            {isEditMode && (
              <>
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="button-group" style={{ marginTop: '30px' }}>
                  <button
                    className="profile-button"
                    onClick={isEditMode ? handleUpdateProfile : handleEditToggle}
                    disabled={isLoading}
                  >
                    {isEditMode ? 'Save Profile' : 'Edit Profile'}
                  </button>
                  {isEditMode && (
                    <button
                      className="profile-button secondary"
                      onClick={handleEditToggle}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}
            {!isEditMode && (
              <div className="button-group" style={{ marginTop: '20px' }}>
                <button
                  className="profile-button"
                  onClick={isEditMode ? handleUpdateProfile : handleEditToggle}
                  disabled={isLoading}
                >
                  {isEditMode ? 'Save Profile' : 'Edit Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
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