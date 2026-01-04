const form = document.getElementById("authForm");
const mensagem = document.getElementById("mensagem");

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
            tipo: 'login'}),
    });

    const data = await res.json();

    if (!res.ok) {
      mensagem.textContent = data.error || "Erro ao autenticar";
      return;
    }

    // sucesso
    window.location.href = "/perfil/dashboard.html"; // você cria depois

  } catch (err) {
    mensagem.textContent = "Erro de conexão";
  }
});