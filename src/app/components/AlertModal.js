'use client';

import { useEffect } from 'react';

export default function AlertModal({ isOpen, message, type, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);  
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        <h3 style={{ color: type === 'error' ? 'red' : 'green' }}>
          {type === 'error' ? 'Error' : 'Success'}
        </h3>
        <p>{message}</p>
        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ marginTop: '20px' }}
        >
          OK
        </button>
      </div>
    </div>
  );
}