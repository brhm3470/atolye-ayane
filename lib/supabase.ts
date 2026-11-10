import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://atqffvglyuyroqxgtems.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2EcJ9yHWMYaVcQHp-xwxjg_lP2Mc2Zj';

let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return clientInstance;
}
