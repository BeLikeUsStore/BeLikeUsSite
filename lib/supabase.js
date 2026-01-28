import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: Variáveis de ambiente do Supabase não foram encontradas. Verifique seu arquivo .env ou as configurações da Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);