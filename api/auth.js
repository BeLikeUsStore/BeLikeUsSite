import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password, tipo } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }

  // ===== LOGIN =====
  if (tipo === 'login') {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({ user: data.user });
  }

  // ===== CADASTRO =====
  if (tipo === 'cadastro') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // cria registro na tabela usuarios
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert([
        {
          id: data.user.id,
          email: email,
          pontos: 0,
        },
      ]);

    if (insertError) {
      return res.status(500).json({ error: 'Erro ao criar perfil' });
    }

    return res.status(201).json({ user: data.user });
  }

  return res.status(400).json({ error: 'Tipo inválido' });
}