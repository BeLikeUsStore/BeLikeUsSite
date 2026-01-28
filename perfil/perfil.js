import { supabase } from "/lib/supabase.js";

const form = document.getElementById("authForm");
const mensagem = document.getElementById("mensagem");
const btnSubmit = document.getElementById("btnSubmit");
const authTitle = document.getElementById("authTitle");

// Novos elementos para controle de visibilidade
const containerSenha = document.getElementById("containerSenha");
const inputSenha = document.getElementById("password");
const btnEsqueci = document.getElementById("btnEsqueci");

const tabLogin = document.getElementById("tabLogin");
const tabCadastro = document.getElementById("tabCadastro");

let tipoAuth = "login";

function alternarAbas(novoTipo) {
    tipoAuth = novoTipo;
    mensagem.textContent = ""; 
    
    // Reset visual das abas
    tabLogin.classList.remove("tab-active", "tab-inactive");
    tabCadastro.classList.remove("tab-active", "tab-inactive");

    if (tipoAuth === "login") {
        tabLogin.classList.add("tab-active");
        tabCadastro.classList.add("tab-inactive");
        authTitle.innerText = "Bem-vindo de volta.";
        btnSubmit.innerText = "Entrar";
        containerSenha.style.display = "block";
        inputSenha.required = true;
    } else if (tipoAuth === "cadastro") {
        tabCadastro.classList.add("tab-active");
        tabLogin.classList.add("tab-inactive");
        authTitle.innerText = "Junte-se à comunidade.";
        btnSubmit.innerText = "Criar Minha Conta";
        containerSenha.style.display = "block";
        inputSenha.required = true;
    } else if (tipoAuth === "recuperar") {
        // Estado de recuperação de senha
        tabLogin.classList.add("tab-inactive");
        tabCadastro.classList.add("tab-inactive");
        authTitle.innerText = "Recuperar senha.";
        btnSubmit.innerText = "Enviar e-mail de recuperação";
        containerSenha.style.display = "none";
        inputSenha.required = false;
    }
}

tabLogin.addEventListener("click", () => alternarAbas("login"));
tabCadastro.addEventListener("click", () => alternarAbas("cadastro"));
btnEsqueci.addEventListener("click", () => alternarAbas("recuperar"));

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = inputSenha.value;

    mensagem.style.color = "#000";
    mensagem.textContent = "Carregando...";
    btnSubmit.disabled = true;

    try {
        let result;

        if (tipoAuth === "login") {
            result = await supabase.auth.signInWithPassword({ email, password });
        } else if (tipoAuth === "cadastro") {
            result = await supabase.auth.signUp({ email, password });
        } else if (tipoAuth === "recuperar") {
            // Lógica para enviar e-mail de recuperação
            result = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/perfil/reset-senha.html',
            });
        }

        if (result.error) {
            mensagem.style.color = "#ef4444";
            mensagem.textContent = result.error.message;
            btnSubmit.disabled = false;
            return;
        }

        if (tipoAuth === "cadastro") {
            mensagem.textContent = "Conta criada! Confirme seu email para continuar.";
            btnSubmit.disabled = false;
            return;
        }

        if (tipoAuth === "recuperar") {
            mensagem.textContent = "Link de recuperação enviado para o seu e-mail.";
            btnSubmit.disabled = false;
            return;
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
            window.location.replace("/perfil/dashboard.html");
        } else {
            mensagem.textContent = "Erro ao iniciar sessão";
            btnSubmit.disabled = false;
        }

    } catch (err) {
        mensagem.style.color = "#ef4444";
        mensagem.textContent = "Erro inesperado";
        btnSubmit.disabled = false;
    }
});