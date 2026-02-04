import { supabase } from "/lib/supabase.js";

async function verificarSessao() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "/perfil/login.html";
    return;
  }

  const userId = data.session.user.id;
  const token = data.session.access_token;

  // 1. Carrega dados básicos (Nome, Pontos Totais)
  await carregarPerfil(userId);

  // 2. Processa o login diário
  await processarLoginDiario(token);

  // 3. Atualiza as Barras de Progresso (Missões)
  await atualizarProgressoTarefas(userId);
}

/**
 * ==========================================
 * ATUALIZAR VISUAL DAS TAREFAS (Barras e X/Y)
 * ==========================================
 */
async function atualizarProgressoTarefas(userId) {
  const hoje = new Date().toISOString().slice(0, 10);

  // Busca APENAS o histórico de hoje (Isso faz o "Reset Diário")
  const { data: historico, error } = await supabase
    .from("pontos_historico")
    .select("tipo, produto_id")
    .eq("user_id", userId)
    .gte("created_at", `${hoje}T00:00:00`)
    .lte("created_at", `${hoje}T23:59:59`);

  if (error) return console.error("Erro ao buscar progresso:", error);

  // --- PROGRESSO LOGIN ---
  const jaFezLogin = localStorage.getItem("ultimo_login_diario_data") === hoje;
  if (jaFezLogin) {
    document.getElementById("check-login")?.classList.remove("hidden");
    const bar = document.getElementById("progresso-login-bar");
    if (bar) bar.style.width = "100%";
  }

  // --- PROGRESSO ARTIGO ---
  const leuArtigo = historico.some(item => item.tipo === "ler_artigo");
  const progressoArtigo = leuArtigo ? 1 : 0;
  
  const textoArtigo = document.getElementById("progresso-artigo-texto");
  if (textoArtigo) textoArtigo.innerText = `${progressoArtigo}/1`;
  
  const barArtigo = document.getElementById("progresso-artigo-bar");
  if (barArtigo) barArtigo.style.width = leuArtigo ? "100%" : "0%";

  // --- PROGRESSO LOJA (X/15) - A MÁGICA ACONTECE AQUI ---
  
  // 1. Separa apenas cliques de loja
  const cliquesLoja = historico.filter(item => item.tipo === "visita_loja");

  // 2. Cria uma lista de PRODUTOS ÚNICOS clicados hoje
  // O "Set" remove duplicatas automaticamente se o ID for igual
  const produtosUnicos = new Set(cliquesLoja.map(item => item.produto_id));
  
  const contagemUnica = produtosUnicos.size;

  // 3. Trava visual em 15 (para a barra não estourar 100%)
  const visitasLimitadas = Math.min(contagemUnica, 15);
  const porcentagemLoja = (visitasLimitadas / 15) * 100;

  // 4. Atualiza o texto e a barra
  const textoLoja = document.getElementById("progresso-loja-texto");
  if (textoLoja) textoLoja.innerText = `${contagemUnica}/15`; 

  const barLoja = document.getElementById("progresso-loja-bar");
  if (barLoja) {
      barLoja.style.width = `${porcentagemLoja}%`;
      // Se completou a missão, muda para verde
      if (contagemUnica >= 15) {
          barLoja.classList.remove("bg-black");
          barLoja.classList.add("bg-green-500");
      }
  }
}

/**
 * ============================
 * LÓGICA DE LOGIN DIÁRIO (CACHE LOCAL)
 * ============================
 */
async function processarLoginDiario(token) {
  const hoje = new Date().toISOString().slice(0, 10);
  const ultimoLogin = localStorage.getItem("ultimo_login_diario_data");

  if (ultimoLogin === hoje) return;

  const ganhou = await ganharPontos("login_diario", token);

  if (ganhou) {
    localStorage.setItem("ultimo_login_diario_data", hoje);
    document.getElementById("check-login")?.classList.remove("hidden");
    const bar = document.getElementById("progresso-login-bar");
    if (bar) bar.style.width = "100%";
  }
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

  if (error) return console.error("Erro ao carregar perfil:", error);

  const nomeExibido = data.username || data.email;
  const elNome = document.getElementById("nomeUsuario");
  if (elNome) elNome.innerText = nomeExibido;

  const nomeFeed = document.getElementById("nomeUsuarioFeed");
  if (nomeFeed) nomeFeed.innerText = nomeExibido;

  atualizarPontosNaTela(data.pontos);
}

function atualizarPontosNaTela(valor) {
  const pontosEl = document.getElementById("pontosUsuario");
  if (pontosEl) pontosEl.innerText = valor;
}

// ============================
// LOGOUT
// ============================
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("ultimo_login_diario_data");
  window.location.href = "/perfil/login.html";
});

// ============================
// GANHAR PONTOS (API)
// ============================
async function ganharPontos(tipo, tokenOpcional = null) {
  let token = tokenOpcional;
  if (!token) {
    const sessionData = await supabase.auth.getSession();
    token = sessionData.data.session?.access_token;
  }
  
  if (!token) return false;

  try {
    const response = await fetch("/api/pontos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ tipo })
    });

    const result = await response.json();

    if (response.ok) {
      atualizarPontosNaTela(result.pontos);
      return true;
    } 
    
    if (response.status === 400 && result.error === "Já recebido hoje") {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Erro de conexão:", error);
    return false;
  }
}

// ============================
// MODAL CONFIG CONTA
// ============================
const abrirBtn = document.getElementById("abrirConfigConta");
const modal = document.getElementById("modalConfigConta");
const fecharBtn = document.getElementById("fecharConfigConta");

abrirBtn?.addEventListener("click", () => modal?.classList.remove("hidden"));
fecharBtn?.addEventListener("click", () => modal?.classList.add("hidden"));
modal?.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// INIT
verificarSessao();