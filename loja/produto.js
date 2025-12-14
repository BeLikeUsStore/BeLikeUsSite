document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("produtosGrid");
  if (!grid || typeof produtos === "undefined") return;

  produtos.forEach((produto, index) => {
    const destaque = index === 0;

    const article = document.createElement("article");
    article.className = destaque
      ? "md:col-span-2 grid md:grid-cols-2 gap-8 items-center"
      : "";

    article.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}"
        class="rounded-xl w-full object-cover ${destaque ? "" : "mb-4"}">

      <div>
        <h2 class="${destaque ? "text-2xl" : "text-xl"} font-light">${produto.nome}</h2>
        <p class="mt-1">${produto.preco}</p>
        <p class="mt-3 text-gray-600 ${destaque ? "" : "text-sm"}">
          ${produto.descricao}
        </p>

        <a href="/loja/produto.html?id=${produto.id}"
          class="inline-block mt-4 px-5 py-2 border rounded-full text-sm hover:bg-black hover:text-white transition">
          Ver na loja
        </a>
      </div>
    `;

    grid.appendChild(article);
  });
});