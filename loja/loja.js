// ===== ELEMENTOS =====
const grid = document.getElementById("produtosGrid");
const filtros = document.querySelectorAll("[data-filtro]");
const ordenacao = document.getElementById("ordenacao");

// ===== ESTADO =====
let categoriaAtiva = "todos";
let ordenacaoAtiva = "padrao";

// ===== RENDER =====
function renderProdutos(lista) {
  grid.innerHTML = "";

  lista.forEach(produto => {
    const artigo = document.createElement("article");
    artigo.className = "animate-fade-in";

    artigo.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}"
        class="rounded-xl w-full object-cover mb-4">

      <h3 class="text-xl font-light">${produto.nome}</h3>
      <p class="mt-1">R$ ${produto.preco}</p>
      <p class="mt-3 text-gray-600 text-sm">${produto.descricao}</p>

      <a href="/loja/produto.html?id=${produto.id}"
        class="inline-block mt-4 px-5 py-2 border rounded-full text-sm hover:bg-black hover:text-white transition">
        Ver na loja
      </a>
    `;

    grid.appendChild(artigo);
  });
}

// ===== FILTRO + ORDENACAO =====
function atualizarProdutos() {
  let lista = [...produtos];

  // filtro
  if (categoriaAtiva !== "todos") {
    lista = lista.filter(p => p.categoria === categoriaAtiva);
  }

  // ordenação
  if (ordenacaoAtiva === "menor") {
    lista.sort((a, b) => a.preco - b.preco);
  }

  if (ordenacaoAtiva === "maior") {
    lista.sort((a, b) => b.preco - a.preco);
  }

  renderProdutos(lista);
}

// ===== EVENTOS =====
filtros.forEach(botao => {
  botao.addEventListener("click", () => {
    categoriaAtiva = botao.dataset.filtro;
    atualizarProdutos();
  });
});

ordenacao.addEventListener("change", e => {
  ordenacaoAtiva = e.target.value;
  atualizarProdutos();
});

// ===== INIT =====
atualizarProdutos();