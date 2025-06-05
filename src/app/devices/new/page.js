'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';
import AlertModal from '../../components/AlertModal';
import { supabase } from '../../lib/supabase';

export default function DeviceNewPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    id: uuidv4(),
    name: '',
    brand: '',
    ip: '',
    application: '',
    url: '',
    description: '',
    serial: '',
    glb_url: '',
    rack: '',
    slot: '',
    category: '',
  });
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'success',
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAssetLoading, setIsAssetLoading] = useState(false);
  const [racks, setRacks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slots, setSlots] = useState(
    Array.from({ length: 20 }, (_, i) => ({ slot: (i + 1).toString() }))
  );
  const [showRackDropdown, setShowRackDropdown] = useState(false);
  const [showSlotDropdown, setShowSlotDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [preloadAssets, setPreloadAssets] = useState([]);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetFile, setNewAssetFile] = useState(null);
  const rackInputRef = useRef(null);
  const rackDropdownRef = useRef(null);
  const slotInputRef = useRef(null);
  const slotDropdownRef = useRef(null);
  const categoryInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const assetInputRef = useRef(null);
  const assetDropdownRef = useRef(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const MAX_SLOTS = 20;

  useEffect(() => {
    const fetchRacks = async () => {
      try {
        const response = await fetch('/api/devices?endpoint=racks');
        if (!response.ok) throw new Error('Failed to fetch racks');
        const racks = await response.json();
        setRacks(racks);
      } catch (error) {
        console.error('Error fetching racks:', error);
        setModal({
          isOpen: true,
          message: 'Gagal mengambil data rack',
          type: 'error',
        });
      }
    };

    const fetchCategories = async () => {
      try {
        const { data: devices, error } = await supabase.from('devices').select('category');
        if (error) throw error;
        const uniqueCategories = [
          ...new Set(devices.map((d) => d.category).filter((c) => c)),
        ].sort();
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setModal({
          isOpen: true,
          message: 'Gagal mengambil data kategori',
          type: 'error',
        });
      }
    };

    const fetchPreloadAssets = async () => {
      try {
        const response = await fetch('/api/devices?endpoint=preload-assets');
        if (!response.ok) throw new Error('Failed to fetch preload assets');
        const assets = await response.json();
        setPreloadAssets(assets);
      } catch (error) {
        console.error('Error fetching preload assets:', error);
        setModal({
          isOpen: true,
          message: 'Gagal mengambil preload assets',
          type: 'error',
        });
      }
    };

    fetchRacks();
    fetchCategories();
    fetchPreloadAssets();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        rackDropdownRef.current &&
        !rackDropdownRef.current.contains(event.target) &&
        rackInputRef.current &&
        !rackInputRef.current.contains(event.target)
      ) {
        setShowRackDropdown(false);
      }
      if (
        slotDropdownRef.current &&
        !slotDropdownRef.current.contains(event.target) &&
        slotInputRef.current &&
        !slotInputRef.current.contains(event.target)
      ) {
        setShowSlotDropdown(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target) &&
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        assetDropdownRef.current &&
        !assetDropdownRef.current.contains(event.target) &&
        assetInputRef.current &&
        !assetInputRef.current.contains(event.target)
      ) {
        setShowAssetDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rack') {
      if (value === '' || /^\d{1,2}$/.test(value)) {
        const numericValue = parseInt(value, 10);
        if (value === '' || numericValue >= 0) {
          setFormData({ ...formData, rack: value, slot: '' });
          setShowRackDropdown(true);
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRackSelect = (rackValue) => {
    setFormData({ ...formData, rack: rackValue, slot: '' });
    setShowRackDropdown(false);
    rackInputRef.current.focus();
  };

  const handleSlotSelect = (slotValue) => {
    setFormData({ ...formData, slot: slotValue });
    setShowSlotDropdown(false);
    slotInputRef.current.focus();
  };

  const handleCategorySelect = (categoryValue) => {
    setFormData({ ...formData, category: categoryValue });
    setShowCategoryDropdown(false);
    categoryInputRef.current.focus();
  };

  const handleAssetSelect = async (asset) => {
    setFormData({ ...formData, glb_url: asset.url });
    setShowAssetDropdown(false);
    assetInputRef.current.focus();
  };

  const confirmAssetDelete = (assetName) => {
    setConfirmModal({
      isOpen: true,
      message: `Apakah Anda yakin ingin menghapus asset "${assetName}"?`,
      onConfirm: () => handleAssetDelete(assetName),
    });
  };

  const handleAssetDelete = async (assetName) => {
    try {
      const response = await fetch('/api/devices?endpoint=preload-assets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetName }),
      });
      if (!response.ok) throw new Error('Failed to delete preload asset');
      setPreloadAssets(preloadAssets.filter((asset) => asset.name !== assetName));
      setModal({
        isOpen: true,
        message: 'Preload asset berhasil dihapus',
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting asset:', error);
      setModal({
        isOpen: true,
        message: 'Gagal menghapus preload asset',
        type: 'error',
      });
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetName || !newAssetFile) {
      setModal({
        isOpen: true,
        message: 'Nama asset dan file GLB wajib diisi',
        type: 'error',
      });
      return;
    }
    if (!newAssetFile.name.toLowerCase().endsWith('.glb')) {
      setModal({
        isOpen: true,
        message: 'File harus berekstensi .glb',
        type: 'error',
      });
      return;
    }
    if (newAssetFile.size > MAX_FILE_SIZE) {
      setModal({
        isOpen: true,
        message: 'Ukuran file GLB melebihi batas maksimum 20MB',
        type: 'error',
      });
      return;
    }
    if (preloadAssets.some((asset) => asset.name === newAssetName + '.glb')) {
      setModal({
        isOpen: true,
        message: 'Nama asset sudah ada, pilih nama lain',
        type: 'error',
      });
      return;
    }

    setIsAssetLoading(true);

    try {
      const signedUrlResponse = await fetch('/api/devices?endpoint=generate-signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetName: newAssetName + '.glb' }),
      });
      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json();
        throw new Error(errorData.error || 'Gagal mendapatkan signed URL');
      }
      const { signedUrl, path } = await signedUrlResponse.json();

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: newAssetFile,
        headers: { 'Content-Type': 'model/gltf-binary' },
      });
      if (!uploadResponse.ok) {
        throw new Error('Gagal mengunggah file ke Supabase');
      }

      const publicUrl = supabase.storage.from('device-models').getPublicUrl(path).data.publicUrl;
      const newAsset = {
        name: newAssetName + '.glb',
        path,
        url: publicUrl,
      };

      setPreloadAssets([...preloadAssets, newAsset].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAddAssetModal(false);
      setNewAssetName('');
      setNewAssetFile(null);
      setModal({
        isOpen: true,
        message: 'Asset baru berhasil ditambahkan',
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding asset:', error);
      setModal({
        isOpen: true,
        message: error.message,
        type: 'error',
      });
    } finally {
      setIsAssetLoading(false);
    }
  };

  const handleNewAssetFileChange = (e) => {
    setNewAssetFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rack || !formData.slot || !formData.category || !formData.glb_url) {
      setModal({
        isOpen: true,
        message: 'Rack, Slot, Category, dan Asset 3D wajib diisi',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      const rackValue = formData.rack === '0' ? 0 : parseInt(formData.rack, 10);
      const slotValue = parseInt(formData.slot, 10);
      if (isNaN(rackValue) && formData.rack !== '0') {
        throw new Error('Nomor rack tidak valid');
      }
      if (isNaN(slotValue) || slotValue < 1 || slotValue > MAX_SLOTS) {
        throw new Error('Nomor slot tidak valid');
      }

      // Check rack device count
      const rackResponse = await fetch(`/api/devices?endpoint=rack-device-count&rack=${rackValue}`);
      if (!rackResponse.ok) throw new Error('Gagal memeriksa rack');
      const { count } = await rackResponse.json();
      if (count >= MAX_SLOTS) {
        setModal({
          isOpen: true,
          message: 'Rak sudah penuh: Tidak dapat menambahkan perangkat karena rak sudah memiliki 20 perangkat',
          type: 'error',
        });
        return;
      }

      // Check if slot is used
      const { data: existingDevice, error: slotError } = await supabase
        .from('devices')
        .select('id')
        .eq('rack', rackValue)
        .eq('slot', slotValue)
        .single();
      if (slotError && slotError.code !== 'PGRST116') {
        throw new Error('Gagal memeriksa slot');
      }
      if (existingDevice) {
        setModal({
          isOpen: true,
          message: 'Slot sudah digunakan, silakan pilih slot lain',
          type: 'error',
        });
        return;
      }

      let glbUrl = formData.glb_url;

      if (glbUrl) {
        const sanitizedName = (formData.name || 'device').replace(/\s+/g, '-');
        const fileName = `${sanitizedName}-${formData.id}.glb`;
        const asset = preloadAssets.find((a) => a.url === glbUrl);
        if (asset) {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('device-models')
            .download(asset.path);
          if (downloadError) throw new Error(`Gagal mengunduh asset: ${downloadError.message}`);

          const { error: uploadError } = await supabase.storage
            .from('device-models')
            .upload(fileName, fileData, { upsert: true });
          if (uploadError) throw new Error(`Gagal mengunggah file: ${uploadError.message}`);

          glbUrl = supabase.storage.from('device-models').getPublicUrl(fileName).data.publicUrl;
        }
      }

      const deviceData = { ...formData, rack: rackValue, slot: slotValue, glb_url: glbUrl };
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan perangkat');
      }

      setModal({
        isOpen: true,
        message: 'Perangkat berhasil ditambahkan!',
        type: 'success',
      });
      setTimeout(() => router.push('/'), 500);
    } catch (error) {
      setModal({
        isOpen: true,
        message: error.message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });
  const closeConfirmModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

  return (
    <>
      <Head>
        <title>Tambah Perangkat - Your Brand</title>
      </Head>
      <div className="container mt-5" style={{ maxWidth: '700px' }}>
        <h3 className="mb-4 text-center">Tambah Perangkat</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Rack <span className="text-danger">*</span></label>
            <div className="rack-container">
              <input
                ref={rackInputRef}
                type="text"
                name="rack"
                className="form-control rack-input"
                value={formData.rack}
                onChange={handleChange}
                onFocus={() => setShowRackDropdown(true)}
                placeholder="Masukkan nomor rack atau pilih nomor rack di bawah ini"
                required
              />
              {showRackDropdown && (
                <div ref={rackDropdownRef} className="rack-dropdown">
                  <div className="rack-dropdown-header">
                    <span>Pilih Nomor Rack</span>
                  </div>
                  {racks.map((rack) => (
                    <div
                      key={rack.value}
                      className="rack-dropdown-item"
                      onClick={() => handleRackSelect(rack.value)}
                    >
                      <span className="rack-option-label">{rack.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Slot <span className="text-danger">*</span></label>
            <div className="rack-container">
              <input
                ref={slotInputRef}
                type="text"
                name="slot"
                className="form-control rack-input"
                value={formData.slot}
                onFocus={() => formData.rack && setShowSlotDropdown(true)}
                placeholder="Pilih nomor slot"
                readOnly
                disabled={!formData.rack}
                required
              />
              {showSlotDropdown && (
                <div ref={slotDropdownRef} className="rack-dropdown">
                  <div className="rack-dropdown-header">
                    <span>Pilih Nomor Slot</span>
                  </div>
                  {slots.map((slot) => (
                    <div
                      key={slot.slot}
                      className="rack-dropdown-item"
                      onClick={() => handleSlotSelect(slot.slot)}
                    >
                      <span className="rack-option-label">Slot {slot.slot}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Kategori <span className="text-danger">*</span></label>
            <div className="rack-container">
              <input
                ref={categoryInputRef}
                type="text"
                name="category"
                className="form-control rack-input"
                value={formData.category}
                onChange={handleChange}
                onFocus={() => setShowCategoryDropdown(true)}
                placeholder="Masukkan atau pilih kategori"
                required
              />
              {showCategoryDropdown && (
                <div ref={categoryDropdownRef} className="rack-dropdown">
                  <div className="rack-dropdown-header">
                    <span>Pilih Kategori</span>
                  </div>
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="rack-dropdown-item"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <span className="rack-option-label">{category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Asset 3D <span className="text-danger">*</span></label>
            <div className="rack-container">
              <input
                ref={assetInputRef}
                type="text"
                className="form-control rack-input"
                value={formData.glb_url ? formData.glb_url.split('/').pop() : ''}
                onFocus={() => setShowAssetDropdown(true)}
                placeholder="Pilih asset atau tambahkan asset baru"
                readOnly
                required
              />
              {showAssetDropdown && (
                <div ref={assetDropdownRef} className="rack-dropdown">
                  <div className="rack-dropdown-header">
                    <span>Pilih Asset 3D</span>
                  </div>
                  {preloadAssets.map((asset) => (
                    <div key={asset.name} className="asset-row">
                      <span
                        className="asset-name"
                        onClick={() => handleAssetSelect(asset)}
                      >
                        {asset.name}
                      </span>
                      <button
                        type="button"
                        className="btn asset-delete"
                        onClick={() => confirmAssetDelete(asset.name)}
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                  <div className="rack-dropdown-item">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowAddAssetModal(true)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                    >
                      Tambah Asset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {[
            { name: 'name', label: 'Nama Perangkat', placeholder: 'Masukkan nama perangkat' },
            { name: 'brand', label: 'Brand', placeholder: 'Masukkan brand perangkat' },
            { name: 'ip', label: 'IP Address', placeholder: 'Masukkan IP Address' },
            { name: 'application', label: 'Aplikasi', placeholder: 'Masukkan aplikasi terkait' },
            { name: 'url', label: 'URL Aplikasi', placeholder: 'Masukkan URL aplikasi' },
            { name: 'serial', label: 'Serial Number', placeholder: 'Masukkan nomor seri' },
          ].map(({ name, label, placeholder }) => (
            <div className="mb-3" key={name}>
              <label className="form-label">{label}</label>
              <input
                type="text"
                name={name}
                className="form-control"
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label">Deskripsi</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="Masukkan deskripsi perangkat"
              rows={3}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/')}
              disabled={isLoading}
            >
              Batal
            </button>
          </div>
        </form>

        {showAddAssetModal && (
          <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
              <h3 className="mb-3">Tambah Asset Baru</h3>
              <div className="mb-3">
                <label className="form-label">Nama Asset</label>
                <input
                  type="text"
                  className="form-control"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="Masukkan nama asset"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">File GLB</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".glb"
                  onChange={handleNewAssetFileChange}
                />
                <small className="form-text text-muted">
                  Maksimum ukuran file: 20MB
                </small>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddAsset}
                  disabled={isAssetLoading}
                >
                  {isAssetLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddAssetModal(false);
                    setNewAssetName('');
                    setNewAssetFile(null);
                  }}
                  disabled={isAssetLoading}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal.isOpen && (
          <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
              <h3 className="mb-3">Konfirmasi Hapus</h3>
              <p>{confirmModal.message}</p>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmModal.onConfirm}
                >
                  Hapus
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeConfirmModal}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        <AlertModal
          isOpen={modal.isOpen}
          message={modal.message}
          type={modal.type}
          onClose={closeModal}
        />
      </div>
    </>
  );
}