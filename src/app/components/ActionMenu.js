'use client';

import { useState } from 'react';
import { useBulkActions } from './BulkActionContext';

export default function ActionMenu({ toggleSelectAll }) {
  const [isOpen, setIsOpen] = useState(false);
  const { onBulkDownload, onBulkDelete } = useBulkActions();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectAll = () => {
    toggleSelectAll();
    setIsOpen(false);
  };

  return (
    <div className="action-menu-container">
      <button
        onClick={handleToggle}
        className="btn action-menu-toggle"
        title="More Actions"
        aria-label="Open action menu"
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>

      {isOpen && (
        <div className="action-menu-dropdown">
          <button
            className="btn btn-primary dropdown-item"
            onClick={handleSelectAll}
          >
            <i className="bi bi-check2-square me-2"></i>
            Select All
          </button>
          <button
            className="btn btn-primary dropdown-item"
            onClick={() => {
              onBulkDownload();
              setIsOpen(false);
            }}
          >
            <i className="bi bi-download me-2"></i>
            Download QR
          </button>
          <button
            className="btn btn-danger dropdown-item"
            onClick={() => {
              onBulkDelete();
              setIsOpen(false);
            }}
          >
            <i className="bi bi-trash me-2"></i>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}