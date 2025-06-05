'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBulkActions } from './BulkActionContext';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function UserTable({
  setUsers,
  setSelectedUsers,
  users,
  selectedUsers,
  showBulkDeleteModal,
  setShowBulkDeleteModal,
  handleBulkDelete,
}) {
  const { setOnBulkDelete } = useBulkActions();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPageOptions = ['All', 5, 10, 20, 50, 100];
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [originalUsers, setOriginalUsers] = useState([]);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchTimeoutRef = useRef(null);

  function UserActionMenu({ toggleSelectAll }) {
    const [isOpen, setIsOpen] = useState(false);
    const { onBulkDelete } = useBulkActions();

    const handleToggle = () => setIsOpen(!isOpen);

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
            <button className="btn btn-primary dropdown-item" onClick={handleSelectAll}>
              <i className="bi bi-check2-square me-2"></i>Select All
            </button>
            <button
              className="btn btn-danger dropdown-item"
              onClick={() => {
                onBulkDelete();
                setIsOpen(false);
              }}
            >
              <i className="bi bi-trash me-2"></i>Delete
            </button>
          </div>
        )}
      </div>
    );
  }

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
    setOnBulkDelete(() => () => setShowBulkDeleteModal(true));
  }, [setOnBulkDelete, setShowBulkDeleteModal]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          const text = await response.text();
          console.error('Failed to fetch users, response:', text);
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
        setOriginalUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, [setUsers]);

  const refetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to refetch users, response:', text);
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setUsers(data);
      setOriginalUsers(data);
    } catch (error) {
      console.error('Failed to refetch users:', error);
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

  const getSortedUsers = (list) => {
    if (!sortConfig.key) return list;
    return [...list].sort((a, b) => {
      const valA = (a[sortConfig.key] || '').toString().toLowerCase();
      const valB = (b[sortConfig.key] || '').toString().toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const searchFilterOptions = [
    { label: 'username:', value: 'username:', description: 'Mencari pengguna berdasarkan username' },
    { label: 'name:', value: 'name:', description: 'Mencari pengguna berdasarkan nama' },
    { label: 'role:', value: 'role:', description: 'Mencari pengguna berdasarkan peran' },
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
    const filterTypes = ['username:', 'name:', 'role:'];
    const filterPart = filterTypes.find((type) => input.toLowerCase().startsWith(type.toLowerCase()));
    if (filterPart) {
      return { filterType: filterPart.slice(0, -1).toLowerCase(), searchTerm: input.slice(filterPart.length).trim() };
    }
    return { filterType: 'all', searchTerm: input.trim() };
  };

  const { filterType, searchTerm: parsedSearchTerm } = parseSearchInput(searchTerm);

  const filteredUsers = getSortedUsers(
    (sortConfig.key === null ? originalUsers : users).filter((user) => {
      if (!parsedSearchTerm) return true;
      const searchLower = parsedSearchTerm.toLowerCase();
      switch (filterType) {
        case 'username':
          return user.username.toLowerCase().includes(searchLower);
        case 'name':
          return user.name.toLowerCase().includes(searchLower);
        case 'role':
          return user.role.toLowerCase().includes(searchLower);
        case 'all':
        default:
          return (
            user.username.toLowerCase().includes(searchLower) ||
            user.name.toLowerCase().includes(searchLower) ||
            user.role.toLowerCase().includes(searchLower)
          );
      }
    })
  );

  const totalPages = itemsPerPage === Infinity ? 1 : Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    itemsPerPage === Infinity ? 0 : (currentPage - 1) * itemsPerPage,
    itemsPerPage === Infinity ? undefined : currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedUsers.length === displayedUsers.length) {
      setSelectedUsers([]);
    } else {
      const newSelected = displayedUsers.map((user) => user.id);
      setSelectedUsers(newSelected);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleTouchStart = (userId, e) => {
    if (isMobile) {
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.closest('button')) return;
      touchStartRef.current = { userId, startX: e.touches[0].clientX, startY: e.touches[0].clientY };
      touchTimeoutRef.current = setTimeout(() => {
        if (touchStartRef.current && touchStartRef.current.userId === userId) {
          e.preventDefault();
          setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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

  const handleDelete = async (ids, isBulk = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.isArray(ids) ? ids : [ids] }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error(isBulk ? 'Failed to bulk delete users, response:' : 'Failed to delete user, response:', text);
        throw new Error('Network response was not ok');
      }
      setSelectedUsers((prev) => prev.filter((id) => !ids.includes(id)));
      await refetchUsers();
      if (isBulk) await handleBulkDelete();
    } catch (error) {
      console.error(isBulk ? 'Failed to bulk delete users:' : 'Failed to delete user:', error);
      alert(`Failed to ${isBulk ? 'bulk delete users' : 'delete user'}. Please try again.`);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(null);
      setShowBulkDeleteModal(false);
    }
  };

  const sortOptions = [
    { label: 'None', value: '' },
    { label: 'Username ↑', value: 'username:asc' },
    { label: 'Username ↓', value: 'username:desc' },
    { label: 'Name ↑', value: 'name:asc' },
    { label: 'Name ↓', value: 'name:desc' },
    { label: 'Role ↑', value: 'role:asc' },
    { label: 'Role ↓', value: 'role:desc' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-primary btn-add-device" onClick={() => router.push('/user/new')}>
            <i className="bi bi-plus me-1"></i>Add User
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
              <option key={option} value={option}>
                {option === 'All' ? 'All' : option}
              </option>
            ))}
          </select>
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search users..."
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
        {!isMobile && <div className="action-menu-wrapper"><UserActionMenu toggleSelectAll={toggleSelectAll} /></div>}
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
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="action-menu-wrapper-mobile ms-auto">
            <UserActionMenu toggleSelectAll={toggleSelectAll} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center my-4">Loading users...</div>
      ) : (
        <>
          {!isMobile ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === displayedUsers.length && displayedUsers.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={{ width: '30px', textAlign: 'center' }}>No</th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('username')}>
                      Username {sortConfig.key === 'username' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                      Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('role')}>
                      Role {sortConfig.key === 'role' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('activity')}>
                      Latest Edit {sortConfig.key === 'activity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((user, index) => (
                    <tr key={user.id} aria-selected={selectedUsers.includes(user.id)}>
                      <td className="select-cell">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) =>
                            setSelectedUsers((prev) =>
                              e.target.checked ? [...prev, user.id] : prev.filter((id) => id !== user.id)
                            )
                          }
                        />
                      </td>
                      <td className="no-cell">{itemsPerPage === Infinity ? index + 1 : (currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{user.username || 'N/A'}</td>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.role || 'N/A'}</td>
                      <td>{user.activity ? new Date(user.activity).toLocaleString() : 'N/A'}</td>
                      <td className="actions-cell">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => router.push(`/user/edit/${user.id}`)}
                          title="Edit User"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setShowDeleteModal(user.id)}
                          title="Delete User"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="user-card-container">
              {displayedUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`user-card ${selectedUsers.includes(user.id) ? 'selected-card' : ''}`}
                  onTouchStart={(e) => handleTouchStart(user.id, e)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                >
                  <div className="card-header">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) =>
                        setSelectedUsers((prev) =>
                          e.target.checked ? [...prev, user.id] : prev.filter((id) => id !== user.id)
                        )
                      }
                    />
                    <span className="card-no">{itemsPerPage === Infinity ? index + 1 : (currentPage - 1) * itemsPerPage + index + 1}</span>
                    <span className="card-title">{user.username || 'N/A'}</span>
                  </div>
                  <div className="card-details">
                    <div className="detail-row">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{user.name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Role:</span>
                      <span className="detail-value">{user.role || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Latest Edit:</span>
                      <span className="detail-value">
                        {user.activity ? new Date(user.activity).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => router.push(`/user/edit/${user.id}`)}
                      title="Edit User"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setShowDeleteModal(user.id)}
                      title="Delete User"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showDeleteModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius, 8px)', padding: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                <h3>Konfirmasi Hapus</h3>
                <p>Apakah Anda yakin ingin menghapus pengguna ini?</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowDeleteModal(null)} className="btn btn-secondary" disabled={isLoading}>
                    Batal
                  </button>
                  <button onClick={() => handleDelete(showDeleteModal)} className="btn btn-danger" disabled={isLoading}>
                    {isLoading ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Menghapus...</> : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBulkDeleteModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius, 8px)', padding: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                <h3>Konfirmasi Hapus</h3>
                <p>Apakah Anda yakin ingin menghapus pengguna-pengguna ini?</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowBulkDeleteModal(false)} className="btn btn-secondary" disabled={isLoading}>
                    Batal
                  </button>
                  <button onClick={() => handleDelete(selectedUsers, true)} className="btn btn-danger" disabled={isLoading}>
                    {isLoading ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Menghapus...</> : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {itemsPerPage !== Infinity && (
            <div className="d-flex justify-content-center mt-3 align-items-center gap-3">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                {'< Prev'}
              </button>
              <span style={{ fontSize: '13px' }}>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                {'Next >'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}