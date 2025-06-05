'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import DeviceTable from './components/DeviceTable';
import AlertModal from './components/AlertModal';
import { generateBulkQRPDF } from './lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchDevices = async () => {
        try {
          const response = await fetch('/api/devices');
          const data = await response.json();
          if (response.ok) {
            setDevices(data);
          } else {
            console.error('Failed to fetch devices:', data.message || 'Unknown error');
            setAlertModal({
              isOpen: true,
              message: 'Failed to load devices. Please try again later.',
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error fetching devices:', error);
          setAlertModal({
            isOpen: true,
            message: 'An unexpected error occurred while loading devices.',
            type: 'error',
          });
        }
      };
      fetchDevices();
    }
  }, []);

  const handleBulkDownload = useCallback(async () => {
    const selectedData = devices.filter((device) =>
      selectedDevices.includes(device.id)
    );
    if (selectedData.length > 0) {
      await generateBulkQRPDF(selectedData);
    } else {
      setAlertModal({
        isOpen: true,
        message: 'Please select at least one device to download QR codes.',
        type: 'error',
      });
    }
  }, [devices, selectedDevices]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedDevices.length > 0) {
      try {
        console.log('Initiating bulk delete for device IDs:', selectedDevices);
        const response = await fetch('/api/devices', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedDevices }),
        });

        console.log('Bulk delete response status:', response.status);
        let data;
        try {
          data = await response.json();
          console.log('Bulk delete response data:', data);
        } catch (jsonError) {
          console.warn('No JSON response body (possibly 204 No Content):', jsonError);
          data = {};
        }

        if (response.ok) {
          console.log('Bulk delete successful, updating state');
          setDevices((prev) => prev.filter((device) => !selectedDevices.includes(device.id)));
          setSelectedDevices([]);
          setShowBulkDeleteModal(null);
          setAlertModal({
            isOpen: true,
            message: data.message || 'Selected devices deleted successfully.',
            type: 'success',
          });
        } else {
          console.error('Bulk delete failed with status:', response.status, 'data:', data);
          setAlertModal({
            isOpen: true,
            message: data.error || `Failed to delete devices (Status: ${response.status}).`,
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        setAlertModal({
          isOpen: true,
          message: 'An unexpected error occurred while deleting devices.',
          type: 'error',
        });
      }
    } else {
      console.log('No devices selected for bulk delete');
      setAlertModal({
        isOpen: true,
        message: 'Please select at least one device to delete.',
        type: 'error',
      });
    }
  }, [selectedDevices]);

  const handleAlertClose = useCallback(() => {
    console.log('Closing alert modal, type:', alertModal.type);
    setAlertModal({ isOpen: false, message: '', type: 'success' });
    if (alertModal.type === 'success') {
      console.log('Reloading page after successful bulk delete');
      window.location.reload();
    }
  }, [alertModal.type]);

  return (
    <>
      <Head>
        <title>Dashboard - Your Brand</title>
        <meta
          name="description"
          content="Dashboard for managing devices - Pusat Data dan Informasi Kemhan"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="container" style={{ marginTop: '40px' }}>
        <h3>
          <i className="bi bi-table" style={{ marginRight: '10px' }}></i>
          Tabel Informasi Perangkat
        </h3>
        <DeviceTable
          setDevices={setDevices}
          setSelectedDevices={setSelectedDevices}
          devices={devices}
          selectedDevices={selectedDevices}
          showBulkDeleteModal={showBulkDeleteModal}
          setShowBulkDeleteModal={setShowBulkDeleteModal}
          handleBulkDelete={handleBulkDelete}
          handleBulkDownload={handleBulkDownload}
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