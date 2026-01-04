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