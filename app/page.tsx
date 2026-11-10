import { createClient, SupabaseClient } from '@supabase/supabase-js';

const HARDCODED_URL = 'https://atqffvglyuyroqxgtems.supabase.co';
const HARDCODED_KEY = 'sb_publishable_2EcJ9yHWMYaVcQHp-xwxjg_lP2Mc2Zj';

let client: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!client) {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const finalUrl = (envUrl && envUrl.startsWith('http')) ? envUrl : HARDCODED_URL;
    const finalKey = (envKey && envKey.length > 5) ? envKey : HARDCODED_KEY;

    client = createClient(finalUrl, finalKey);
  }
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    const instance = getSupabaseClient();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});
