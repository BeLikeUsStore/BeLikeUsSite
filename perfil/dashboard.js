import { supabase } from "/lib/supabase.js";

async function verificarSessao() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "/perfil/login.html";
    return;
  }

  carregarPerfil(data.session.user.id);
}

/**
 * ============================
 * CARREGAR PERFIL DO USUÁRIO
 * ============================
 * - Busca username, email e pontos
 * - Mostra username
 * - Se não existir username (usuários antigos),
 *   usa email como fallback
 */
async function carregarPerfil(userId) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("email, username, pontos")
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  // prioridade: username > email
  const nomeExibido = data.username || data.email;

  // nome principal (card do perfil)
  document.getElementById("nomeUsuario").innerText = nomeExibido;

  // nome no feed
  const nomeFeed = document.getElementById("nomeUsuarioFeed");
  if (nomeFeed) {
    nomeFeed.innerText = nomeExibido;
  }

  // pontos
  document.getElementById("pontosUsuario").innerText = data.pontos;
}

// logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/perfil/login.html";
});

verificarSessao();

/**
 * ============================
 * GANHAR PONTOS (API SEGURA)
 * ============================
 */
async function ganharPontos(tipo) {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    alert("Sessão expirada");
    return;
  }

  const token = data.session.access_token;

  const response = await fetch("/api/pontos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ tipo })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error(result.error);
    return;
  }

  document.getElementById("pontosUsuario").innerText = result.pontos;
}

// ============================
// MODAL CONFIG CONTA
// ============================
const abrirBtn = document.getElementById("abrirConfigConta");
const modal = document.getElementById("modalConfigConta");
const fecharBtn = document.getElementById("fecharConfigConta");

// abrir
abrirBtn?.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// fechar
fecharBtn?.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// fechar clicando fora
modal?.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});
