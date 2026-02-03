import { supabase } from "/lib/supabase.js";

// ===== ELEMENTOS =====
const grid = document.getElementById("produtosGrid");
const filtros = document.querySelectorAll("[data-filtro]");
const ordenacao = document.getElementById("ordenacao");

// ===== ESTADO =====
let produtos = []; 
let categoriaAtiva = "todos";
let ordenacaoAtiva = "padrao";

// ===== 1. BUSCAR DO SUPABASE =====
async function carregarProdutos() {
  grid.innerHTML = '<p class="col-span-full text-center py-20 text-gray-400 animate-pulse">Carregando curadoria...</p>';
  
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('estoque_ativo', true);

  if (error) {
    console.error("Erro ao carregar:", error);
    grid.innerHTML = '<p class="col-span-full text-center text-red-500">Erro ao carregar produtos.</p>';
    return;
  }

  produtos = data;
  atualizarProdutos();
}

// ===== 2. LÓGICA DE CLIQUE E PONTOS =====
window.registrarClique = async (produtoId, linkAfiliado) => {
    // Abre a loja em nova aba imediatamente
    window.open(linkAfiliado, '_blank');

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        console.log(`Usuário ${session.user.email} clicou no produto ${produtoId}.`);
        // Aqui você pode adicionar a chamada para sua tabela de logs/pontos futuramente
    }
};

// ===== 3. RENDERIZAR (ESTILO EDITORIAL / FARFETCH) =====
function renderProdutos(lista) {
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center py-10 text-gray-400 font-light">Nenhum item encontrado nesta categoria.</p>';
    return;
  }

  lista.forEach(produto => {
    const artigo = document.createElement("article");
    // 'group' permite controlar os filhos (imagens) no hover
    artigo.className = "group cursor-pointer animate-fade-in"; 

    const precoFormatado = parseFloat(produto.preco_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    // Fallback caso não tenha a segunda imagem cadastrada ainda
    const imgPrincipal = produto.imagem_url;
    const imgHover = produto.imagem_hover_url || produto.imagem_url;

    artigo.innerHTML = `
      <div class="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9] mb-4" 
           onclick="window.registrarClique('${produto.id}', '${produto.link_afiliado}')">
        
        <img src="${imgPrincipal}" alt="${produto.nome}"
          class="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-in-out group-hover:opacity-0">
          
        <img src="${imgHover}" alt="${produto.nome} vestindo"
          class="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100">
        
        <div class="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/20 to-transparent">
          <button class="w-full bg-white text-black py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold border border-white hover:bg-black hover:text-white transition-colors">
            Ver na Loja
          </button>
        </div>
      </div>

      <div class="space-y-1 px-1">
        <h3 class="text-sm font-light tracking-tight text-gray-900">${produto.nome}</h3>
        <div class="flex justify-between items-baseline">
          <p class="text-[11px] text-gray-400 uppercase tracking-widest">${produto.marca || 'Curadoria'}</p>
          <p class="text-sm font-medium text-black">R$ ${precoFormatado}</p>
        </div>
      </div>
    `;

    grid.appendChild(artigo);
  });
}

// ===== 4. FILTROS E ORDENAÇÃO =====
function atualizarProdutos() {
  let lista = [...produtos];

  if (categoriaAtiva !== "todos") {
    lista = lista.filter(p => p.categoria && p.categoria.toLowerCase() === categoriaAtiva.toLowerCase());
  }

  if (ordenacaoAtiva === "menor") {
    lista.sort((a, b) => a.preco_original - b.preco_original);
  } else if (ordenacaoAtiva === "maior") {
    lista.sort((a, b) => b.preco_original - a.preco_original);
  }

  renderProdutos(lista);
}

// ===== EVENTOS =====
filtros.forEach(botao => {
  botao.addEventListener("click", () => {
    filtros.forEach(b => b.classList.remove('bg-black', 'text-white'));
    filtros.forEach(b => b.classList.add('bg-white', 'text-black'));
    
    botao.classList.remove('bg-white', 'text-black');
    botao.classList.add('bg-black', 'text-white');

    categoriaAtiva = botao.dataset.filtro;
    atualizarProdutos();
  });
});

ordenacao.addEventListener("change", e => {
  ordenacaoAtiva = e.target.value;
  atualizarProdutos();
});

// Iniciar
carregarProdutos();