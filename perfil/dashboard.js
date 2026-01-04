import { supabase } from '/lib/supabase.js';

async function verificarSessao() {
  const { data, error } = await supabase.auth.getSession();

  if (!data.session) {
    // não está logado
    window.location.href = '/login.html';
    return;
  }

  carregarPerfil(data.session.user.id);
}

async function carregarPerfil(userId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('nome, pontos')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById('nomeUsuario').innerText = data.nome;
  document.getElementById('pontosUsuario').innerText = data.pontos;
}

verificarSessao();