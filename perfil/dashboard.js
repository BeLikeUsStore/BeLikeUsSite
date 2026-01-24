import { supabase } from "/lib/supabase.js";

async function verificarSessao() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "/perfil/login.html";
    return;
  }

  // Carrega perfil visualmente (nome, email, etc)
  await carregarPerfil(data.session.user.id);

  // 🔥 LOGIN DIÁRIO OTIMIZADO
  // Só chama a função se ainda não tiver processado hoje
  await processarLoginDiario(data.session.access_token);
}

/**
 * ============================
 * LÓGICA DE LOGIN DIÁRIO (CACHE LOCAL)
 * ============================
 */
async function processarLoginDiario(token) {
  const hoje = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD
  const ultimoLogin = localStorage.getItem("ultimo_login_diario_data");

  // SE JÁ TEM NO LOCALSTORAGE A DATA DE HOJE, ABORTA (Não gasta API)
  if (ultimoLogin === hoje) {
    console.log("Login diário já validado localmente hoje.");
    return;
  }

  console.log("Verificando login diário na API...");
  
  // Se não tem salvo, chama a API para tentar ganhar ou confirmar
  const ganhou = await ganharPontos("login_diario", token);

  // Se ganhou (true) ou se a API disse que já tinha ganho (que também retorna true na nossa logica ajustada abaixo)
  // salvamos no localStorage para não tentar mais hoje.
  if (ganhou) {
    localStorage.setItem("ultimo_login_diario_data", hoje);
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

  if (error) {
    console.error("Erro ao carregar perfil:", error);
    return;
  }

  const nomeExibido = data.username || data.email;

  const elNome = document.getElementById("nomeUsuario");
  if (elNome) elNome.innerText = nomeExibido;

  const nomeFeed = document.getElementById("nomeUsuarioFeed");
  if (nomeFeed) nomeFeed.innerText = nomeExibido;

  atualizarPontosNaTela(data.pontos);
}

// ============================
// AUXILIAR: ATUALIZAR UI PONTOS
// ============================
function atualizarPontosNaTela(valor) {
  const pontosEl = document.getElementById("pontosUsuario");
  if (pontosEl) pontosEl.innerText = valor;
}

// ============================
// LOGOUT
// ============================
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("ultimo_login_diario_data"); // Limpa o cache ao sair
  window.location.href = "/perfil/login.html";
});

// ============================
// GANHAR PONTOS (API)
// ============================
async function ganharPontos(tipo, tokenOpcional = null) {
  // Se o token não veio por parâmetro, tenta pegar da sessão atual
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

    // SUCESSO (200)
    if (response.ok) {
      console.log(`Pontos ganhos (${tipo}):`, result.pontos);
      atualizarPontosNaTela(result.pontos);
      
      // Feedback visual simples (opcional)
      // alert("Você ganhou +50 pontos pelo login diário!"); 
      return true; // Indica que o processo foi concluído com sucesso
    } 
    
    // ERRO: JÁ GANHOU HOJE (400)
    // Se a API retornar que já ganhou, consideramos "sucesso" para salvar no localStorage
    if (response.status === 400 && result.error === "Já recebido hoje") {
      console.log("API informou: Já recebido hoje.");
      return true; // Retorna true para gravar no localStorage e não tentar de novo
    }

    // OUTROS ERROS
    console.warn("Erro ao ganhar pontos:", result.error);
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

abrirBtn?.addEventListener("click", () => {
  modal?.classList.remove("hidden");
});

fecharBtn?.addEventListener("click", () => {
  modal?.classList.add("hidden");
});

modal?.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// INIT
verificarSessao();