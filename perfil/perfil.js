import { supabase } from "/lib/supabase.js";

const form = document.getElementById("authForm");
const mensagem = document.getElementById("mensagem");
const btnSubmit = document.getElementById("btnSubmit");
const authTitle = document.getElementById("authTitle");

// Elementos das Abas (Novo no design)
const tabLogin = document.getElementById("tabLogin");
const tabCadastro = document.getElementById("tabCadastro");

let tipoAuth = "login";

// Função para alternar o estado entre Login e Cadastro
function alternarAbas(novoTipo) {
    tipoAuth = novoTipo;
    
    if (tipoAuth === "login") {
        // Estilo visual das abas
        tabLogin.classList.add("tab-active");
        tabLogin.classList.remove("tab-inactive");
        tabCadastro.classList.add("tab-inactive");
        tabCadastro.classList.remove("tab-active");
        
        // Textos
        authTitle.innerText = "Bem-vindo de volta.";
        btnSubmit.innerText = "Entrar";
    } else {
        // Estilo visual das abas
        tabCadastro.classList.add("tab-active");
        tabCadastro.classList.remove("tab-inactive");
        tabLogin.classList.add("tab-inactive");
        tabLogin.classList.remove("tab-active");
        
        // Textos
        authTitle.innerText = "Junte-se à comunidade.";
        btnSubmit.innerText = "Criar Minha Conta";
    }
    mensagem.textContent = ""; 
}

// Eventos de clique nas abas
tabLogin.addEventListener("click", () => alternarAbas("login"));
tabCadastro.addEventListener("click", () => alternarAbas("cadastro"));

// Submit do formulário (Sua lógica original preservada)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    mensagem.style.color = "#000"; // Cor preta para o carregando
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
            mensagem.style.color = "#ef4444"; // Vermelho para erro
            mensagem.textContent = result.error.message;
            return;
        }

        // Lógica de sucesso do seu arquivo original
        if (tipoAuth === "cadastro") {
            mensagem.textContent = "Conta criada! Confirme seu email para continuar.";
            return;
        }

        const { data } = await supabase.auth.getSession();

        if (data.session) {
            // Usando replace para evitar o bug do "voltar" no mobile
            window.location.replace("/perfil/dashboard.html");
        } else {
            mensagem.textContent = "Erro ao iniciar sessão";
        }

    } catch (err) {
        mensagem.style.color = "#ef4444";
        mensagem.textContent = "Erro inesperado";
    }
});