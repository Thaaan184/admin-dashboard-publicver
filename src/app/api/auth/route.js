import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password, name, role') // Ensure id is included
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    return NextResponse.json({ 
      message: 'Login successful', 
      user: { 
        id: user.id, // Include id in response
        username: user.username, 
        name: user.name, 
        role: user.role 
      } 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}