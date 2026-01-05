const toggle = document.getElementById("perfilToggle");
const dropdown = document.getElementById("perfilDropdown");

const menuLogado = document.getElementById("menuLogado");
const menuDeslogado = document.getElementById("menuDeslogado");

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

// ===== ESTADO TEMPORÁRIO =====
// depois isso vem do Supabase
const usuarioLogado = false; // MUDE PARA true PRA TESTAR

if (usuarioLogado) {
  menuLogado.classList.remove("hidden");
  menuDeslogado.classList.add("hidden");
} else {
  menuDeslogado.classList.remove("hidden");
  menuLogado.classList.add("hidden");
}