import { supabase } from "/lib/supabase.js";

async function ativarGatilhoLeitura() {
    const alvo = document.getElementById("fim-do-artigo");
    if (!alvo) return;

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            // O usuário chegou ao fim!
            observer.disconnect(); // Para de observar para não repetir o envio
            await enviarPontosLeitura();
        }
    }, { threshold: 1.0 }); // 1.0 significa que o elemento deve estar 100% visível

    observer.observe(alvo);
}

async function enviarPontosLeitura() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
        const response = await fetch("/api/pontos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ tipo: "ler_artigo" })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log("Parabéns! Você leu o artigo e ganhou pontos.");
            // Opcional: Mostrar um aviso discreto na tela para o usuário
        }
    } catch (err) {
        console.warn("Erro ao processar bônus de leitura.");
    }
}

window.addEventListener("DOMContentLoaded", ativarGatilhoLeitura);