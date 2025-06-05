'use client';

import { useState, useEffect } from 'react';
import { generateQRWithLogo } from '../lib/utils';

export default function QRModal({ deviceId, deviceName, onClose }) {
  const [qrImage, setQrImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    generateQRWithLogo(deviceId)
      .then((dataUrl) => setQrImage(dataUrl))
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        setError('Failed to generate QR code. Please try again.');
        setQrImage(null);
      });
  }, [deviceId]);

  const handleDownload = () => {
    if (!qrImage) {
      console.error('Cannot download: QR image is not available');
      return;
    }
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr-${deviceName}.png`;
    link.click();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius)',
        padding: '20px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}>
        <h3>QR Code for {deviceName}</h3>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : qrImage ? (
          <img src={qrImage} alt="QR Code" style={{ maxWidth: '100%', marginBottom: '10px' }} />
        ) : (
          <p>Loading QR code...</p>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
          <button onClick={handleDownload} disabled={!qrImage} className="btn btn-primary">
            Download QR
          </button>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}