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

    window.location.href = "/perfil/dashboard.html";

  } catch (err) {
    mensagem.textContent = "Erro de conexão";
  }
});

const btnCadastro = document.getElementById("btnCadastro");

btnCadastro.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    mensagem.textContent = "Preencha email e senha";
    return;
  }

  mensagem.textContent = "Criando conta...";

  try {
    const res = await fetch("/api/auth.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        tipo: "cadastro",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mensagem.textContent = data.error || "Erro ao criar conta";
      return;
    }

    mensagem.textContent = "Conta criada! Agora é só entrar.";
  } catch (err) {
    mensagem.textContent = "Erro de conexão";
  }
});
