import { supabase } from "/lib/supabase.js";

async function registrarLeitura() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) return;

  const token = data.session.access_token;

  try {
    await fetch("/api/pontos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ tipo: "leitura_artigo" })
    });
  } catch (err) {
    console.warn("Erro ao registrar leitura");
  }
}

// dispara ao carregar o artigo
registrarLeitura();