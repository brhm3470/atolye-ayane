import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://atqffvglyuyroqxgtems.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2EcJ9yHWMYaVcQHp-xwxjg_lP2Mc2Zj';

export const supabase = createClient(
  SUPABASE_URL && SUPABASE_URL.startsWith('http') 
    ? SUPABASE_URL 
    : 'https://atqffvglyuyroqxgtems.supabase.co',
  SUPABASE_ANON_KEY || 'sb_publishable_2EcJ9yHWMYaVcQHp-xwxjg_lP2Mc2Zj'
);
