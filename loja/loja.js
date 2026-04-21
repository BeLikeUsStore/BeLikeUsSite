import { supabase } from "/lib/supabase.js";

// ===== ELEMENTOS =====
const grid = document.getElementById("produtosGrid");
const filtros = document.querySelectorAll("[data-filtro]");
const ordenacao = document.getElementById("ordenacao");

// ===== ESTADO =====
let produtos = []; 
let categoriaAtiva = "todos";
let generoAtivo = "masculino";
let ordenacaoAtiva = "padrao";

// ===== FUNÇÃO TOAST (O AVISO BONITÃO) =====
function showToast(mensagem) {
    const toast = document.createElement("div");
    // Estilo Preto e Branco (Igual a logo), arredondado e com sombra
    toast.className = "fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-black text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2 animate-bounce-subtle text-sm tracking-wide";
    toast.innerHTML = `<span>${mensagem}</span>`;
    
    document.body.appendChild(toast);

    // Remove depois de 3 segundos
    setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity", "duration-500");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ===== 1. BUSCAR DO SUPABASE =====
async function carregarProdutos() {
  grid.innerHTML = '<p class="col-span-full text-center py-20 text-gray-400 animate-pulse font-light">Carregando curadoria...</p>';
  
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('estoque_ativo', true);

  if (error) {
    grid.innerHTML = '<p class="col-span-full text-center text-red-500">Erro ao carregar produtos.</p>';
    return;
  }

  produtos = data;
  atualizarProdutos();
}

// ===== 2. LÓGICA DE CLIQUE E PONTOS =====
window.registrarClique = async (produtoId, linkAfiliado) => {
    window.open(linkAfiliado, '_blank');

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        const userId = session.user.id;
        const hoje = new Date().toISOString().split('T')[0];

        const { data: jaClicou } = await supabase
            .from('pontos_historico')
            .select('id')
            .eq('user_id', userId)
            .eq('produto_id', produtoId)
            .eq('tipo', 'visita_loja')
            .gte('created_at', `${hoje}T00:00:00`)
            .lte('created_at', `${hoje}T23:59:59`)
            .maybeSingle();

        if (!jaClicou) {
            const { error } = await supabase
                .from('pontos_historico')
                .insert([{ 
                    user_id: userId, 
                    tipo: 'visita_loja', 
                    produto_id: produtoId,
                    pontos: 1 
                }]);

            if (!error) {
                showToast("✨ +1 ponto na missão diária!");
            }
        }
    }
};

// ===== 3. RENDERIZAR =====
function renderProdutos(lista) {
  grid.innerHTML = "";
  if (lista.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center py-10 text-gray-400 font-light">Nenhum item encontrado.</p>';
    return;
  }

  lista.forEach(produto => {
    const artigo = document.createElement("article");
    artigo.className = "group cursor-pointer animate-fade-in"; 
    const precoFormatado = parseFloat(produto.preco_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    artigo.innerHTML = `
      <div class="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9] mb-4" 
           onclick="window.registrarClique('${produto.id}', '${produto.link_afiliado}')">
        <img src="${produto.imagem_url}" class="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 group-hover:opacity-0">
        <img src="${produto.imagem_hover_url || produto.imagem_url}" class="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 opacity-0 group-hover:opacity-100">
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

function atualizarProdutos() {
  let lista = [...produtos];

  // 1. Filtra por Gênero (Crucial para não misturar)
  lista = lista.filter(p => p.genero === generoAtivo || p.genero === "unissex");

  // 2. Filtra por Categoria (Se não for "todos")
  if (categoriaAtiva !== "todos") {
    lista = lista.filter(p => p.categoria?.toLowerCase() === categoriaAtiva.toLowerCase());
  }

  // 3. Ordenação
  if (ordenacaoAtiva === "menor") {
    lista.sort((a, b) => a.preco_original - b.preco_original);
  } else if (ordenacaoAtiva === "maior") {
    lista.sort((a, b) => b.preco_original - a.preco_original);
  }

  renderProdutos(lista);
}

filtros.forEach(botao => {
  botao.addEventListener("click", () => {
    filtros.forEach(b => { b.classList.remove('bg-black', 'text-white'); b.classList.add('bg-white', 'text-black'); });
    botao.classList.replace('bg-white', 'bg-black');
    botao.classList.replace('text-black', 'text-white');
    categoriaAtiva = botao.dataset.filtro;
    atualizarProdutos();
  });
});

ordenacao.addEventListener("change", e => { ordenacaoAtiva = e.target.value; atualizarProdutos(); });
carregarProdutos();

// ===== LÓGICA DE TROCA DE GÊNERO =====
const botoesGenero = document.querySelectorAll(".genero-btn");

botoesGenero.forEach(botao => {
  botao.addEventListener("click", () => {
    // 1. Estética: Muda as cores dos botões
    botoesGenero.forEach(b => {
      b.classList.remove('text-black', 'border-b', 'border-black');
      b.classList.add('text-gray-400');
    });
    botao.classList.remove('text-gray-400');
    botao.classList.add('text-black', 'border-b', 'border-black');

    // 2. Lógica: Atualiza o gênero ativo e reseta a categoria para "todos"
    generoAtivo = botao.dataset.genero;
    categoriaAtiva = "todos";
    
    // 3. Reseta visualmente os botões de categoria para o "Todos" ficar marcado
    filtros.forEach(b => {
      b.classList.remove('bg-black', 'text-white');
      b.classList.add('bg-white', 'text-black');
      if(b.dataset.filtro === "todos") {
        b.classList.replace('bg-white', 'bg-black');
        b.classList.replace('text-black', 'text-white');
      }
    });

    atualizarProdutos();
  });
});