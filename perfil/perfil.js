const form = document.getElementById("authForm");
const mensagem = document.getElementById("mensagem");
const btnCadastro = document.getElementById("btnCadastro");

let tipoAuth = "login";

// alterna entre login e cadastro
btnCadastro.addEventListener("click", () => {
  tipoAuth = tipoAuth === "login" ? "cadastro" : "login";

  btnCadastro.textContent =
    tipoAuth === "login"
      ? "Criar conta"
      : "Já tenho conta";

  mensagem.textContent =
    tipoAuth === "login"
      ? "Entrar com sua conta"
      : "Criar nova conta";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  mensagem.textContent = "Carregando...";

  try {
    const res = await fetch("/api/auth.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        tipo: tipoAuth,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mensagem.textContent = data.error || "Erro ao autenticar";
      return;
    }

    // sucesso
    window.location.href = "/perfil/dashboard.html";

  } catch (err) {
    mensagem.textContent = "Erro de conexão";
  }
});
