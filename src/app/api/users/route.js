import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const { data: users, error } = await supabase.from('users').select('id, username, name, role, activity');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, name, password, role } = await request.json();

    // Validasi input
    if (!username || !name || !password || !role) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // Validasi role
    if (!['admin', 'operator'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid. Harus "admin" atau "operator"' }, { status: 400 });
    }

    // Cek apakah username sudah ada
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    }
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = tidak ada data
      return NextResponse.json({ error: checkError.message }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Format activity sebagai ISO string
    const activity = new Date().toISOString(); // Supabase mengharapkan format seperti '2025-05-26T00:43:00.000Z'

    // Insert user baru (id akan diisi otomatis oleh Supabase)
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        name,
        password: hashedPassword,
        role,
        activity,
      })
      .select('id, username, name, role, activity')
      .single();

    if (error) {
      console.error('Supabase error:', error); // Log error untuk debugging
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { ids } = await request.json();
    
    // Check if any of the users to be deleted is an admin
    const { data: usersToDelete, error: fetchError } = await supabase
      .from('users')
      .select('role')
      .in('id', ids);
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Check if any user has admin role
    const hasAdmin = usersToDelete.some(user => user.role === 'admin');
    if (hasAdmin) {
      return NextResponse.json({ error: 'Tidak bisa menghapus user dengan role admin' }, { status: 403 });
    }

    // Proceed with deletion if no admins are found
    const { error: deleteError } = await supabase.from('users').delete().in('id', ids);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
    
    return NextResponse.json({ message: 'User berhasil dihapus' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}