import { supabase } from "/lib/supabase.js";

// --- ELEMENTOS DESKTOP ---
const toggle = document.getElementById("perfilToggle");
const dropdown = document.getElementById("perfilDropdown");
const menuLogado = document.getElementById("menuLogado");
const menuDeslogado = document.getElementById("menuDeslogado");
const logoutBtn = document.getElementById("logoutBtn");

// --- ELEMENTOS MOBILE ---
const toggleMobile = document.getElementById("perfilToggleMobile");
const dropdownMobile = document.getElementById("perfilDropdownMobile");
const menuLogadoMobile = document.getElementById("menuLogadoMobile");
const menuDeslogadoMobile = document.getElementById("menuDeslogadoMobile");
const logoutBtnMobile = document.getElementById("logoutBtnMobile");

// 1. FUNCIONAMENTO DOS DROPDOWNS (ABRIR/FECHAR)
toggle?.addEventListener("click", () => dropdown?.classList.toggle("hidden"));

if (toggleMobile && dropdownMobile) {
  toggleMobile.addEventListener("click", () => {
    dropdownMobile.classList.toggle("hidden");
  });
}

// Fechar dropdown ao clicar fora (Desktop)
document.addEventListener("click", (e) => {
  if (!e.target.closest("#perfilMenu")) {
    dropdown?.classList.add("hidden");
  }
});

// 2. VERIFICAÇÃO DE SESSÃO REAL (AQUI ESTÁ A CORREÇÃO)
async function verificarSessao() {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    // ESTADO LOGADO: Mostra o que é de logado e esconde o resto
    menuLogado?.classList.remove("hidden");
    menuLogadoMobile?.classList.remove("hidden");
    
    menuDeslogado?.classList.add("hidden");
    menuDeslogadoMobile?.classList.add("hidden");
  } else {
    // ESTADO DESLOGADO: Mostra botões de login e esconde perfil
    menuDeslogado?.classList.remove("hidden");
    menuDeslogadoMobile?.classList.remove("hidden");
    
    menuLogado?.classList.add("hidden");
    menuLogadoMobile?.classList.add("hidden");
  }
}

// 3. LOGOUT (DESKTOP E MOBILE)
const acaoLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/";
};

logoutBtn?.addEventListener("click", acaoLogout);
logoutBtnMobile?.addEventListener("click", acaoLogout);

// 4. INICIALIZAÇÃO
verificarSessao();