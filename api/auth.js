import { supabase } from '../lib/supabase.js';

export async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) throw error;
  return data;
}

export async function registrar(email, senha) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}