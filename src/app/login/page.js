'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid username or password');
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', 'authenticated');
        localStorage.setItem('userData', JSON.stringify({
          id: data.user.id, // Include id
          username: data.user.username,
          name: data.user.name,
          role: data.user.role
        }));
      }
      router.push('/');
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Head>
        <title>Login - Your Brand</title>
        <meta
          name="description"
          content="Login ke SISFOHANEG Admin Dashboard"
        />
      </Head>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          margin: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="login-container">
          <div className="text-center mb-4">
            <img
              src="Logo-Kemhan.png"
              alt="Kemhan Logo"
              style={{ height: '70px', marginBottom: '10px' }}
            />
            <h2 className="login-title">Admin Login</h2>
            <p className="login-subtitle">
              Sign in to manage AR & 3D devices
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3 position-relative">
              <i className="bi bi-person login-icon"></i>
              <input
                type="text"
                className="form-control login-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 position-relative">
              <i className="bi bi-lock login-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} password-toggle-icon`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
            {error && (
              <div className="text-danger mb-3 text-center" style={{ fontSize: '14px' }}>
                {error}
              </div>
            )}
            <div className="d-grid">
              <button type="submit" className="btn login-button">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}