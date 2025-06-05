'use client';

import { useState } from 'react';

export default function DeleteModal({ deviceId, onClose, onDelete, isBulk = false }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isBulk ? { ids: deviceId } : { id: deviceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete device(s)');
      }

      onDelete();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
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
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}>
        <h3>Konfirmasi Hapus</h3>
        <p>Apakah Anda yakin ingin menghapus {isBulk ? 'perangkat-perangkat ini' : 'perangkat ini'}?</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Menghapus...
              </>
            ) : (
              'Ya, Hapus'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}