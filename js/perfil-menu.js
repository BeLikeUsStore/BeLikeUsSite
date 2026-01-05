import { supabase } from "/lib/supabase.js";

const toggle = document.getElementById("perfilToggle");
const dropdown = document.getElementById("perfilDropdown");

const menuLogado = document.getElementById("menuLogado");
const menuDeslogado = document.getElementById("menuDeslogado");
const logoutBtn = document.getElementById("logoutBtn");

// abrir / fechar dropdown
toggle.addEventListener("click", () => {
  dropdown.classList.toggle("hidden");
});

// fechar ao clicar fora
document.addEventListener("click", (e) => {
  if (!e.target.closest("#perfilMenu")) {
    dropdown.classList.add("hidden");
  }
});

// ===== SUPABASE AUTH =====
async function verificarSessao() {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    // LOGADO
    menuLogado.classList.remove("hidden");
    menuDeslogado.classList.add("hidden");
  } else {
    // DESLOGADO
    menuDeslogado.classList.remove("hidden");
    menuLogado.classList.add("hidden");
  }
}

// logout real
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  });
}

verificarSessao();

// TOGGLE MOBILE
const toggleMobile = document.getElementById("perfilToggleMobile");
const dropdownMobile = document.getElementById("perfilDropdownMobile");

if (toggleMobile && dropdownMobile) {
  toggleMobile.addEventListener("click", () => {
    dropdownMobile.classList.toggle("hidden");
  });
}

const menuLogadoMobile = document.getElementById("menuLogadoMobile");
const menuDeslogadoMobile = document.getElementById("menuDeslogadoMobile");

menuLogado?.classList.remove("hidden");
menuDeslogado?.classList.add("hidden");

menuLogadoMobile?.classList.remove("hidden");
menuDeslogadoMobile?.classList.add("hidden");

document
  .getElementById("logoutBtnMobile")
  ?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  });