import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'Ganti Dengan URL anda';
const supabaseKey = 'Ganti Dengan Servic Role key anda';
export const supabase = createClient(supabaseUrl, supabaseKey);