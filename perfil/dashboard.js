import { supabase } from "/lib/supabase.js";

async function verificarSessao() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "/perfil/login.html";
    return;
  }

  carregarPerfil(data.session.user.id);
}

async function carregarPerfil(userId) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("email, pontos")
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("nomeUsuario").innerText = data.email;
  document.getElementById("pontosUsuario").innerText = data.pontos;
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/perfil/login.html";
});

verificarSessao();

async function ganharPontos(tipo) {
  // 1. pega a sessão atual
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    alert("Sessão expirada");
    return;
  }

  const token = data.session.access_token;

  // 2. chama a API segura
  const response = await fetch("/api/pontos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ tipo })
  });

  const result = await response.json();

  // 3. trata erro
  if (!response.ok) {
    console.error(result.error);
    return;
  }

  // 4. atualiza a UI com os novos pontos
  document.getElementById("pontosUsuario").innerText = result.pontos;
}