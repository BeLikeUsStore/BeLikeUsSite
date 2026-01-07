import { supabase } from "/lib/supabase.js";

async function initAdmin() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "/perfil/login.html";
    return;
  }

  const userId = data.session.user.id;

  // verifica se é admin
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", userId)
    .single();

  if (usuario.role !== "admin") {
    alert("Acesso negado");
    window.location.href = "/";
    return;
  }

  carregarUsuarios();
}

async function carregarUsuarios() {
  const { data } = await supabase
    .from("usuarios")
    .select("id, email, pontos");

  const tbody = document.getElementById("usuariosTable");

  data.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-3">${user.email}</td>
      <td class="p-3">${user.pontos}</td>
      <td class="p-3">
        <button onclick="editarPontos('${user.id}')"
          class="text-sm underline">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editarPontos = async (userId) => {
  const valor = prompt("Novo valor de pontos:");
  if (!valor) return;

  await supabase
    .from("usuarios")
    .update({ pontos: Number(valor) })
    .eq("id", userId);

  location.reload();
};

initAdmin();
