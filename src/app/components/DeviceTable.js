'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QRModal from './QRModal';
import DeleteModal from './DeleteModal';
import ActionMenu from './ActionMenu';
import { useBulkActions } from './BulkActionContext';

export default function DeviceTable({
  setDevices,
  setSelectedDevices,
  devices,
  selectedDevices,
  showBulkDeleteModal,
  setShowBulkDeleteModal,
  handleBulkDelete,
  handleBulkDownload,
}) {
  const { setOnBulkDownload, setOnBulkDelete } = useBulkActions();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showQRModal, setShowQRModal] = useState({ deviceId: null, deviceName: '', position: { top: 0, left: 0 } });
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPageOptions = ['All', 5, 10, 20, 50, 100];
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [originalDevices, setOriginalDevices] = useState([]);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOnBulkDownload(() => handleBulkDownload);
    setOnBulkDelete(() => () => setShowBulkDeleteModal(true));
  }, [setOnBulkDownload, setOnBulkDelete, handleBulkDownload]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/devices');
        const data = await response.json();
        if (response.ok) {
          setDevices(data);
          setOriginalDevices(data);
        } else {
          console.error('Failed to fetch devices:', data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevices();
  }, [setDevices]);

  const refetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      if (response.ok) {
        setDevices(data);
        setOriginalDevices(data);
      } else {
        console.error('Failed to refetch devices:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to refetch devices:', error);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSortChange = (e) => {
    const [key, direction] = e.target.value.split(':');
    setSortConfig({ key: key || null, direction: direction || null });
  };

  const getSortedDevices = (list) => {
    if (!sortConfig.key) return list;
    return [...list].sort((a, b) => {
      if (sortConfig.key === 'rack') {
        const valA = a[sortConfig.key] !== null && a[sortConfig.key] !== undefined ? Number(a[sortConfig.key]) : Infinity;
        const valB = b[sortConfig.key] !== null && b[sortConfig.key] !== undefined ? Number(b[sortConfig.key]) : Infinity;
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      } else {
        const valA = (a[sortConfig.key] || '').toString().toLowerCase();
        const valB = (b[sortConfig.key] || '').toString().toLowerCase();
        return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
    });
  };

  const searchFilterOptions = [
    { label: 'name:', value: 'name:', description: 'Mencari perangkat berdasarkan nama' },
    { label: 'brand:', value: 'brand:', description: 'Mencari perangkat berdasarkan brand/merk' },
    { label: 'category:', value: 'category:', description: 'Mencari perangkat berdasarkan kategori' },
    { label: 'rack:', value: 'rack:', description: 'Mencari perangkat berdasarkan Nomor Rak' },
    { label: 'ip:', value: 'ip:', description: 'Mencari perangkat berdasarkan IP address' },
  ];

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filterPrefixes = searchFilterOptions.map((opt) => opt.value);
    const startsWithFilter = filterPrefixes.some((prefix) =>
      value.toLowerCase().startsWith(prefix.toLowerCase())
    );
    setShowSearchDropdown(value.length > 0 && (startsWithFilter || !value.includes(':')));
  };

  const handleFilterSelect = (filterValue) => {
    setSearchTerm(filterValue);
    setShowSearchDropdown(false);
    searchInputRef.current.focus();
  };

  const parseSearchInput = (input) => {
    const filterTypes = ['name:', 'brand:', 'category:', 'rack:', 'ip:'];
    const filterPart = filterTypes.find((type) => input.toLowerCase().startsWith(type.toLowerCase()));
    if (filterPart) {
      return { filterType: filterPart.slice(0, -1).toLowerCase(), searchTerm: input.slice(filterPart.length).trim() };
    }
    return { filterType: 'all', searchTerm: input.trim() };
  };

  const { filterType, searchTerm: parsedSearchTerm } = parseSearchInput(searchTerm);

  const filteredDevices = getSortedDevices(
    (sortConfig.key === null ? originalDevices : devices).filter((device) => {
      if (!parsedSearchTerm) return true;
      const searchLower = parsedSearchTerm.toLowerCase();
      switch (filterType) {
        case 'name':
          return (device.name || '').toLowerCase().includes(searchLower);
        case 'brand':
          return (device.brand || '').toLowerCase().includes(searchLower);
        case 'category':
          return (device.category || '').toLowerCase().includes(searchLower);
        case 'rack':
          return device.rack !== null && device.rack !== undefined && String(device.rack) === searchLower;
        case 'ip':
          return (device.ip || '').toLowerCase().includes(searchLower);
        case 'all':
        default:
          return (
            (device.name || '').toLowerCase().includes(searchLower) ||
            (device.brand || '').toLowerCase().includes(searchLower) ||
            (device.category || '').toLowerCase().includes(searchLower) ||
            (device.rack !== null && device.rack !== undefined && String(device.rack) === searchLower) ||
            (device.ip || '').toLowerCase().includes(searchLower)
          );
      }
    })
  );

  const totalPages = itemsPerPage === Infinity ? 1 : Math.ceil(filteredDevices.length / itemsPerPage);
  const displayedDevices = filteredDevices.slice(
    itemsPerPage === Infinity ? 0 : (currentPage - 1) * itemsPerPage,
    itemsPerPage === Infinity ? undefined : currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedDevices.length === displayedDevices.length) {
      setSelectedDevices([]);
    } else {
      const newSelected = displayedDevices.map((device) => device.id);
      setSelectedDevices(newSelected);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleRowClick = (deviceId) => {
    if (!isMobile) setExpandedRow(expandedRow === deviceId ? null : deviceId);
  };

  const handleTouchStart = (deviceId, e) => {
    if (isMobile) {
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.closest('button')) return;
      touchStartRef.current = { deviceId, startX: e.touches[0].clientX, startY: e.touches[0].clientY };
      touchTimeoutRef.current = setTimeout(() => {
        if (touchStartRef.current && touchStartRef.current.deviceId === deviceId) {
          e.preventDefault();
          setSelectedDevices((prev) =>
            prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
          );
          touchStartRef.current = null;
        }
      }, 500);
    }
  };

  const handleTouchEnd = (e) => {
    if (isMobile) {
      clearTimeout(touchTimeoutRef.current);
      touchStartRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (isMobile && touchStartRef.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.startX);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.startY);
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(touchTimeoutRef.current);
        touchStartRef.current = null;
      }
    }
  };

  const sortOptions = [
    { label: 'None', value: '' },
    { label: 'Name ↑', value: 'name:asc' },
    { label: 'Name ↓', value: 'name:desc' },
    { label: 'Brand ↑', value: 'brand:asc' },
    { label: 'Brand ↓', value: 'brand:desc' },
    { label: 'Category ↑', value: 'category:asc' },
    { label: 'Category ↓', value: 'category:desc' },
    { label: 'IP ↑', value: 'ip:asc' },
    { label: 'IP ↓', value: 'ip:desc' },
    { label: 'Rack ↑', value: 'rack:asc' },
    { label: 'Rack ↓', value: 'rack:desc' },
  ];

  return (
    <div>
      {isLoading ? (
        <div className="text-center my-4">Loading devices...</div>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-3 align-items-center">
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-primary btn-add-device" onClick={() => router.push('/devices/new')}>
                <i className="bi bi-plus me-1"></i>Add Device
              </button>
              <select
                className="form-select"
                style={{ width: '100px' }}
                value={itemsPerPage === Infinity ? 'All' : itemsPerPage}
                onChange={(e) => {
                  const value = e.target.value === 'All' ? Infinity : parseInt(e.target.value);
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>{option === 'All' ? 'All' : option}</option>
                ))}
              </select>
              <div className="search-container">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="form-control search-input"
                  style={{ maxWidth: '300px' }}
                />
                {showSearchDropdown && (
                  <div ref={dropdownRef} className="search-dropdown">
                    <div className="search-dropdown-header">
                      <span>Opsi Filter mencari</span>
                    </div>
                    {searchFilterOptions.map((option) => (
                      <div
                        key={option.value}
                        className="search-dropdown-item"
                        onClick={() => handleFilterSelect(option.value)}
                      >
                        <span className="search-option-label">{option.label}</span>
                        <span className="search-option-description">{option.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {!isMobile && <div className="action-menu-wrapper"><ActionMenu toggleSelectAll={toggleSelectAll} /></div>}
          </div>

          {isMobile && (
            <div className="sort-action-container d-flex align-items-center mb-2">
              <div className="sort-by-wrapper">
                <span className="sort-by-label">Sort By:</span>
                <select
                  className="sort-by-select"
                  value={sortConfig.key ? `${sortConfig.key}:${sortConfig.direction}` : ''}
                  onChange={handleSortChange}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="action-menu-wrapper-mobile ms-auto">
                <ActionMenu toggleSelectAll={toggleSelectAll} />
              </div>
            </div>
          )}

          {!isMobile ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>
                      <input
                        type="checkbox"
                        checked={selectedDevices.length === displayedDevices.length && displayedDevices.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={{ width: '30px', textAlign: 'center' }}>No</th>
                    <th style={{ width: '30px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('rack')}>
                      Rack {sortConfig.key === 'rack' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                      Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('brand')}>
                      Brand {sortConfig.key === 'brand' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('category')}>
                      Category {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('ip')}>
                      IP {sortConfig.key === 'ip' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedDevices.map((device, index) => (
                    <React.Fragment key={device.id}>
                      <tr onClick={() => handleRowClick(device.id)} style={{ cursor: 'pointer' }} aria-selected={selectedDevices.includes(device.id)}>
                        <td className="select-cell">
                          <input
                            type="checkbox"
                            checked={selectedDevices.includes(device.id)}
                            onChange={(e) =>
                              setSelectedDevices((prev) =>
                                e.target.checked ? [...prev, device.id] : prev.filter((id) => id !== device.id)
                              )
                            }
                          />
                        </td>
                        <td className="no-cell">{itemsPerPage === Infinity ? index + 1 : (currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{device.rack ?? 'N/A'}</td>
                        <td>{device.name || 'N/A'}</td>
                        <td>{device.brand || 'N/A'}</td>
                        <td>{device.category || 'N/A'}</td>
                        <td>{device.ip || 'N/A'}</td>
                        <td className="actions-cell">
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => setShowQRModal({ deviceId: device.id, deviceName: device.name, position: { top: 0, left: 0 } })}
                            title="Show QR Code"
                          >
                            <i className="bi bi-qr-code"></i>
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => router.push(`/devices/edit/${device.id}`)}
                            title="Edit Device"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setShowDeleteModal(device.id)}
                            title="Delete Device"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                      {!isMobile && expandedRow === device.id && (
                        <tr className="table-expand">
                          <td colSpan="8">
                            <table className="table table-bordered table-sm">
                              <tbody>
                                <tr><th>Category</th><td>{device.category || 'N/A'}</td></tr>
                                <tr><th>Application</th><td>{device.application || 'N/A'}</td></tr>
                                <tr><th>URL</th><td>{device.url || 'N/A'}</td></tr>
                                <tr><th>Description</th><td>{device.description || 'N/A'}</td></tr>
                                <tr><th>Serial</th><td>{device.serial || 'N/A'}</td></tr>
                                <tr><th>Slot</th><td>{device.slot || 'N/A'}</td></tr>
                                <tr><th>GLB File</th><td>{device.glb_url ? <a href={device.glb_url} download className="text-primary">Download GLB</a> : 'Not available'}</td></tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="device-card-container">
              {displayedDevices.map((device, index) => (
                <div
                  key={device.id}
                  className={`device-card ${selectedDevices.includes(device.id) ? 'selected-card' : ''}`}
                  onTouchStart={(e) => handleTouchStart(device.id, e)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                >
                  <div className="card-header">
                    <input
                      type="checkbox"
                      checked={selectedDevices.includes(device.id)}
                      onChange={(e) =>
                        setSelectedDevices((prev) =>
                          e.target.checked ? [...prev, device.id] : prev.filter((id) => id !== device.id)
                        )
                      }
                    />
                    <span className="card-no">{itemsPerPage === Infinity ? index + 1 : (currentPage - 1) * itemsPerPage + index + 1}</span>
                    <span className="card-title">{device.name || 'N/A'}</span>
                  </div>
                  <div className="card-details">
                    <div className="detail-row">
                      <span className="detail-label">Brand:</span>
                      <span className="detail-value">{device.brand || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{device.category || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">IP:</span>
                      <span className="detail-value">{device.ip || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Rack:</span>
                      <span className="detail-value">{device.rack ?? 'N/A'}</span>
                    </div>
                    {expandedRow === device.id && (
                      <div className="expanded-details">
                        <div className="detail-row">
                          <span className="detail-label">Category:</span>
                          <span className="detail-value">{device.category || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Application:</span>
                          <span className="detail-value">{device.application || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">URL:</span>
                          <span className="detail-value">{device.url || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Description:</span>
                          <span className="detail-value">{device.description || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Serial:</span>
                          <span className="detail-value">{device.serial || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Slot:</span>
                          <span className="detail-value">{device.slot || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">GLB File:</span>
                          <span className="detail-value">
                            {device.glb_url ? <a href={device.glb_url} download className="text-primary">Download GLB</a> : 'Not available'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setShowQRModal({
                          deviceId: device.id,
                          deviceName: device.name,
                          position: { top: rect.top + window.scrollY, left: rect.left + window.scrollX },
                        });
                      }}
                      title="Show QR Code"
                    >
                      <i className="bi bi-qr-code"></i>
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => router.push(`/devices/edit/${device.id}`)}
                      title="Edit Device"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setShowDeleteModal(device.id)}
                      title="Delete Device"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                    <button
                      className="btn btn-details btn-sm"
                      onClick={() => setExpandedRow(expandedRow === device.id ? null : device.id)}
                      title="Toggle Details"
                    >
                      <i className={`bi ${expandedRow === device.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showQRModal.deviceId && (
            <QRModal
              deviceId={showQRModal.deviceId}
              deviceName={showQRModal.deviceName}
              position={showQRModal.position}
              onClose={() => setShowQRModal({ deviceId: null, deviceName: '', position: { top: 0, left: 0 } })}
            />
          )}

          {showDeleteModal && (
            <DeleteModal deviceId={showDeleteModal} onClose={() => setShowDeleteModal(null)} onDelete={refetchDevices} />
          )}

          {showBulkDeleteModal && (
            <DeleteModal
              deviceId={selectedDevices}
              onClose={() => setShowBulkDeleteModal(null)}
              onDelete={handleBulkDelete}
              isBulk={true}
            />
          )}

          {itemsPerPage !== Infinity && (
            <div className="d-flex justify-content-center mt-3 align-items-center gap-3">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '14px', minWidth: '100px' }}
              >
                {'< Prev'}
              </button>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Page {currentPage} of {totalPages || 1}</span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '14px', minWidth: '100px' }}
              >
                {'Next >'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}