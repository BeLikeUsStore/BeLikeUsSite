import { supabase } from "/lib/supabase.js";

// ============================
// PEGAR ID DO PRODUTO
// ============================
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id")); // 🔴 correção importante

const produto = produtos.find(p => p.id === id);
const container = document.getElementById("produtoContainer");

if (!produto) {
  container.innerHTML = "<p>Produto não encontrado.</p>";
} else {
  container.innerHTML = `
    <img src="${produto.imagem}" class="rounded-xl w-full object-cover">

    <div>
      <h1 class="text-3xl font-light">${produto.nome}</h1>
      <p class="mt-2 text-xl">R$ ${produto.preco}</p>

      <p class="mt-6 text-gray-600 leading-relaxed">
        ${produto.descricao}
      </p>

      <a href="${produto.afiliado ?? "#"}"
         target="_blank"
         rel="nofollow sponsored"
         class="inline-block mt-10 px-8 py-4 bg-black text-white rounded-full hover:opacity-90 transition">
        Comprar na loja parceira
      </a>

      <p class="mt-4 text-xs text-gray-400">
        Este link é afiliado e ajuda a manter a Be Like Us.
      </p>
    </div>
  `;

  // ⬇️ REGISTRA VISITA AO PRODUTO
  registrarVisitaProduto(produto.id);
}

// ============================
// REGISTRAR VISITA (PONTOS)
// ============================
async function registrarVisitaProduto(produtoId) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const token = data.session.access_token;

  try {
    await fetch("/api/pontos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        tipo: "visita_loja",
        produto_id: produtoId
      })
    });
  } catch (err) {
    console.warn("Erro ao registrar visita ao produto");
  }
}