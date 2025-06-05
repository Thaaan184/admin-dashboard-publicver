import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Fungsi untuk mengukur dan log durasi
const logDurasi = (endpoint, operasi, startTime) => {
  const durasi = (performance.now() - startTime).toFixed(2);
  console.log(`[API] Endpoint: ${endpoint} | Operasi: ${operasi} | Durasi: ${durasi} ms`);
};

// GET: Fetch all devices
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (endpoint === 'racks') {
    try {
      const startTime = performance.now();
      const { data: devices, error } = await supabase.from('devices').select('rack');
      logDurasi('racks', 'Ambil data rack', startTime);
      if (error) throw error;
      const uniqueRacks = [
        ...new Set(devices.map((d) => d.rack).filter((r) => r !== null && r !== undefined)),
      ].sort((a, b) => a - b);
      const racks = uniqueRacks.map((r) => ({
        value: r.toString(),
        label: `Rack ${r < 10 && r !== 0 ? '0' + r : r}`,
      }));
      return NextResponse.json(racks, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Gagal mengambil data rack' }, { status: 500 });
    }
  } else if (endpoint === 'preload-assets') {
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.storage
        .from('device-models')
        .list('ready-use-object', { limit: 100 });
      logDurasi('preload-assets', 'Ambil daftar aset', startTime);
      if (error) throw error;
      const sortedAssets = data
        .map((file) => ({
          name: file.name,
          path: `ready-use-object/${file.name}`,
          url: supabase.storage.from('device-models').getPublicUrl(`ready-use-object/${file.name}`).data.publicUrl
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return NextResponse.json(sortedAssets, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Gagal mengambil aset preload' }, { status: 500 });
    }
  } else if (endpoint === 'rack-device-count') {
    try {
      const rack = searchParams.get('rack');
      const deviceId = searchParams.get('deviceId');
      if (!rack) {
        return NextResponse.json({ error: 'Nomor rack diperlukan' }, { status: 400 });
      }
      const rackValue = rack === '0' ? 0 : parseInt(rack, 10);
      if (isNaN(rackValue) && rack !== '0') {
        return NextResponse.json({ error: 'Nomor rack tidak valid' }, { status: 400 });
      }
      let query = supabase
        .from('devices')
        .select('id')
        .eq('rack', rackValue);
      if (deviceId) {
        query = query.neq('id', deviceId);
      }
      const startTime = performance.now();
      const { data: rackDevices, error } = await query;
      logDurasi('rack-device-count', 'Cek jumlah perangkat di rack', startTime);
      if (error) throw error;
      return NextResponse.json({ count: rackDevices.length }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Gagal memeriksa jumlah perangkat di rack' }, { status: 500 });
    }
  } else {
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.from('devices').select('id, name, brand, category, rack, ip, application, url, description, serial, slot, glb_url');
      logDurasi('devices', 'Ambil semua perangkat', startTime);
      if (error) throw error;
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Gagal mengambil data perangkat' }, { status: 500 });
    }
  }
}

// POST: Create a new device or generate signed URL for asset upload
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (endpoint === 'generate-signed-url') {
    try {
      const { assetName } = await request.json();
      if (!assetName || !assetName.toLowerCase().endsWith('.glb')) {
        return NextResponse.json({ error: 'Nama aset dengan ekstensi .glb diperlukan' }, { status: 400 });
      }
      const preloadFileName = `ready-use-object/${assetName}`;
      const startTimeList = performance.now();
      const { data: existingAssets, error: listError } = await supabase.storage
        .from('device-models')
        .list('ready-use-object');
      logDurasi('generate-signed-url', 'Cek aset yang sudah ada', startTimeList);
      if (listError) throw listError;
      if (existingAssets.some((asset) => asset.name === assetName)) {
        return NextResponse.json({ error: 'Nama aset sudah ada' }, { status: 400 });
      }
      const startTimeSign = performance.now();
      const { data, error } = await supabase.storage
        .from('device-models')
        .createSignedUploadUrl(preloadFileName, { expiresIn: 600 });
      logDurasi('generate-signed-url', 'Buat URL tertanda', startTimeSign);
      if (error) throw error;
      return NextResponse.json({ signedUrl: data.signedUrl, path: preloadFileName }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: `Gagal membuat URL tertanda: ${error.message}` }, { status: 500 });
    }
  } else if (endpoint === 'preload-assets') {
    try {
      const formData = await request.formData();
      const assetName = formData.get('name');
      const assetFile = formData.get('file');

      if (!assetName || !assetFile) {
        return NextResponse.json({ error: 'Nama aset dan file diperlukan' }, { status: 400 });
      }
      if (!assetName.toLowerCase().endsWith('.glb')) {
        return NextResponse.json({ error: 'Nama aset harus berakhiran .glb' }, { status: 400 });
      }
      const startTimeList = performance.now();
      const { data: existingAssets, error: listError } = await supabase.storage
        .from('device-models')
        .list('ready-use-object');
      logDurasi('preload-assets', 'Cek aset yang sudah ada', startTimeList);
      if (listError) throw listError;
      if (existingAssets.some((asset) => asset.name === assetName)) {
        return NextResponse.json({ error: 'Nama aset sudah ada' }, { status: 400 });
      }

      const preloadFileName = `ready-use-object/${assetName}`;
      const startTimeUpload = performance.now();
      const { error: uploadError } = await supabase.storage
        .from('device-models')
        .upload(preloadFileName, assetFile, { upsert: true });
      logDurasi('preload-assets', 'Unggah aset', startTimeUpload);
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from('device-models').getPublicUrl(preloadFileName).data.publicUrl;
      return NextResponse.json({ message: 'Aset berhasil ditambahkan', url: publicUrl }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: `Gagal menambahkan aset: ${error.message}` }, { status: 500 });
    }
  } else {
    try {
      const device = await request.json();
      const deviceId = device.id || uuidv4();

      const startTime = performance.now();
      const { error } = await supabase
        .from('devices')
        .insert({
          ...device,
          id: deviceId,
          category: device.category || null,
          slot: device.slot || null
        });
      logDurasi('devices', 'Buat perangkat baru', startTime);
      if (error) throw error;
      return NextResponse.json({ message: 'Perangkat berhasil dibuat' }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'Gagal membuat perangkat' }, { status: 500 });
    }
  }
}

// PUT: Update an existing device
export async function PUT(request) {
  try {
    const device = await request.json();
    const deviceId = device.id;

    const startTime = performance.now();
    const { error } = await supabase
      .from('devices')
      .update({
        ...device,
        category: device.category || null,
        slot: device.slot || null
      })
      .eq('id', deviceId);
    logDurasi('devices', 'Perbarui perangkat', startTime);
    if (error) throw error;
    return NextResponse.json({ message: 'Perangkat berhasil diperbarui' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui perangkat' }, { status: 500 });
  }
}

// DELETE: Delete device(s) or preload asset
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (endpoint === 'preload-assets') {
    try {
      const { assetName } = await request.json();
      if (!assetName) {
        return NextResponse.json({ error: 'Nama aset diperlukan' }, { status: 400 });
      }
      const startTime = performance.now();
      const { error } = await supabase.storage
        .from('device-models')
        .remove([`ready-use-object/${assetName}`]);
      logDurasi('preload-assets', 'Hapus aset', startTime);
      if (error) throw error;
      return NextResponse.json({ message: 'Aset preload berhasil dihapus' }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Gagal menghapus aset preload' }, { status: 500 });
    }
  } else {
    try {
      const { id, ids } = await request.json();

      if (ids) {
        // Bulk delete
        const startTimeFetch = performance.now();
        const { data: devices, error: fetchError } = await supabase
          .from('devices')
          .select('glb_url, name')
          .in('id', ids);
        logDurasi('devices', 'Ambil data perangkat untuk penghapusan massal', startTimeFetch);
        if (fetchError) throw fetchError;

        // Delete GLB files
        for (const device of devices) {
          if (device.glb_url) {
            const fileName = device.glb_url.split('/').pop();
            const startTimeStorage = performance.now();
            const { error: storageError } = await supabase.storage
              .from('device-models')
              .remove([fileName]);
            logDurasi('devices', `Hapus file GLB untuk perangkat ${device.name}`, startTimeStorage);
            if (storageError) console.warn('Gagal menghapus GLB:', storageError.message);
          }
        }

        const startTimeDelete = performance.now();
        const { error: deleteError } = await supabase
          .from('devices')
          .delete()
          .in('id', ids);
        logDurasi('devices', 'Hapus perangkat massal', startTimeDelete);
        if (deleteError) throw deleteError;
      } else {
        // Single delete
        const startTimeFetch = performance.now();
        const { data: device, error: fetchError } = await supabase
          .from('devices')
          .select('glb_url, name')
          .eq('id', id)
          .single();
        logDurasi('devices', 'Ambil data perangkat untuk penghapusan', startTimeFetch);
        if (fetchError) throw fetchError;

        if (device.glb_url) {
          const fileName = device.glb_url.split('/').pop();
          const startTimeStorage = performance.now();
          const { error: storageError } = await supabase.storage
            .from('device-models')
            .remove([fileName]);
          logDurasi('devices', `Hapus file GLB untuk perangkat ${device.name}`, startTimeStorage);
          if (storageError) console.warn('Gagal menghapus GLB:', storageError.message);
        }

        const startTimeDelete = performance.now();
        const { error: deleteError } = await supabase
          .from('devices')
          .delete()
          .eq('id', id);
        logDurasi('devices', 'Hapus perangkat', startTimeDelete);
        if (deleteError) throw deleteError;
      }

      return NextResponse.json({ message: 'Perangkat berhasil dihapus' }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Gagal menghapus perangkat' }, { status: 500 });
    }
  }
}