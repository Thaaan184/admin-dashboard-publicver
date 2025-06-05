import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, name, role, activity')
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { username, name, password, role } = await request.json();

    // Validasi input
    if (!username || !name || !role) {
      return NextResponse.json({ error: 'Semua field wajib diisi (kecuali password)' }, { status: 400 });
    }

    // Validasi role
    if (!['admin', 'operator'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid. Harus "admin" atau "operator"' }, { status: 400 });
    }

    // Cek apakah username sudah digunakan oleh user lain
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .single();

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json({ error: 'Username sudah digunakan oleh user lain' }, { status: 400 });
    }
    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: checkError.message }, { status: 400 });
    }

    const updateData = {
      username,
      name,
      role,
      activity: new Date().toISOString(), // Gunakan format ISO untuk timestamptz
    };

    if (password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, name, role, activity')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}