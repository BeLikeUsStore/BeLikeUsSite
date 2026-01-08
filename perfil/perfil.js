import { supabase } from "/lib/supabase.js";

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

// submit do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  mensagem.textContent = "Carregando...";

  try {
    let result;

    if (tipoAuth === "login") {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      result = await supabase.auth.signUp({
        email,
        password,
      });
    }

    if (result.error) {
      mensagem.textContent = result.error.message;
      return;
    }

    // cadastro exige confirmação
    if (tipoAuth === "cadastro") {
      mensagem.textContent =
        "Conta criada! Confirme seu email para continuar.";
      return;
    }

    // login: sessão já nasce no browser
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      window.location.href = "/perfil/dashboard.html";
    } else {
      mensagem.textContent = "Erro ao iniciar sessão";
    }

  } catch (err) {
    mensagem.textContent = "Erro inesperado";
  }
});