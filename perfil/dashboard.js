import { supabase } from "/lib/supabase.js";

async function verificarSessao() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "/perfil/login.html";
    return;
  }

  // carrega perfil
  await carregarPerfil(data.session.user.id);

  // 🔥 LOGIN DIÁRIO (+50)
  ganharPontos("login_diario");
}

/**
 * ============================
 * CARREGAR PERFIL DO USUÁRIO
 * ============================
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

  const nomeExibido = data.username || data.email;

  document.getElementById("nomeUsuario").innerText = nomeExibido;

  const nomeFeed = document.getElementById("nomeUsuarioFeed");
  if (nomeFeed) nomeFeed.innerText = nomeExibido;

  document.getElementById("pontosUsuario").innerText = data.pontos;
}

// ============================
// LOGOUT
// ============================
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/perfil/login.html";
});

// ============================
// GANHAR PONTOS (API SEGURA)
// ============================
async function ganharPontos(tipo) {
  const { data } = await supabase.auth.getSession();

  if (!data.session) return;

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
    console.warn("Pontos não creditados:", result.error);
    return;
  }

  // atualiza pontos na UI
  const pontosEl = document.getElementById("pontosUsuario");
  if (pontosEl) pontosEl.innerText = result.pontos;
}

// ============================
// MODAL CONFIG CONTA
// ============================
const abrirBtn = document.getElementById("abrirConfigConta");
const modal = document.getElementById("modalConfigConta");
const fecharBtn = document.getElementById("fecharConfigConta");

abrirBtn?.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

fecharBtn?.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal?.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// INIT
verificarSessao();
