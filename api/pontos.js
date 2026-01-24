const { createClient } = require("@supabase/supabase-js");

// 1. MUDANÇA: Usamos a Service Role Key para ter permissão total
// Adicionei um "fallback" (||) caso a variável antiga ainda esteja em cache por alguns minutos
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  // Envolvemos tudo em um try/catch para que, se der erro, o site não receba texto puro (o que trava o JS)
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // =========================
    // AUTH
    // =========================
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token ausente" });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const { tipo, produto_id } = req.body;

    // =========================
    // REGRAS FIXAS (Mantidas idênticas)
    // =========================
    const regras = {
      login_diario: 50,
      ler_artigo: 20,
      visita_loja: 150
    };

    if (!regras[tipo]) {
      return res.status(400).json({ error: "Tipo não permitido" });
    }

    const hoje = new Date().toISOString().slice(0, 10);

    // =========================
    // BUSCA USUÁRIO (Protegido contra falhas)
    // =========================
    // 2. MUDANÇA: Adicionamos tratamento de erro aqui. Antes, se 'usuario' fosse null, o código quebrava.
    const { data: usuario, error: userError } = await supabase
      .from("usuarios")
      .select("pontos")
      .eq("id", user.id)
      .single();

    if (userError || !usuario) {
      // Se não achar o usuário, retornamos erro limpo em vez de quebrar o servidor
      console.error("Erro ao buscar usuário:", userError);
      return res.status(404).json({ error: "Perfil de usuário não encontrado." });
    }

    // Garante que pontos seja um número, mesmo que venha nulo do banco
    let novosPontos = usuario.pontos || 0;

    // =========================
    // LOGIN / ARTIGO (1x por dia)
    // =========================
    if (tipo === "login_diario" || tipo === "ler_artigo") {
      const { data: jaGanhou } = await supabase
        .from("pontos_historico")
        .select("id")
        .eq("user_id", user.id)
        .eq("tipo", tipo)
        .gte("created_at", `${hoje}T00:00:00`)
        .lte("created_at", `${hoje}T23:59:59`)
        .maybeSingle();

      if (jaGanhou) {
        return res.status(400).json({ error: "Já recebido hoje" });
      }

      novosPontos += regras[tipo];

      await supabase.from("pontos_historico").insert({
        user_id: user.id,
        tipo,
        pontos: regras[tipo]
      });
    }

    // =========================
    // VISITA LOJA (15 PRODUTOS)
    // =========================
    if (tipo === "visita_loja") {
      if (!produto_id) {
        return res.status(400).json({ error: "Produto inválido" });
      }

      const { data: jaVisitou } = await supabase
        .from("pontos_historico")
        .select("id")
        .eq("user_id", user.id)
        .eq("tipo", "visita_loja")
        .eq("produto_id", produto_id)
        .gte("created_at", `${hoje}T00:00:00`)
        .lte("created_at", `${hoje}T23:59:59`)
        .maybeSingle();

      if (jaVisitou) {
        // Status 200 pois não é um erro crítico, apenas aviso
        return res.status(200).json({ status: "produto_ja_contado" });
      }

      await supabase.from("pontos_historico").insert({
        user_id: user.id,
        tipo: "visita_loja",
        produto_id
      });

      // Contagem exata para ver se bateu a meta de 15
      const { count } = await supabase
        .from("pontos_historico")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("tipo", "visita_loja")
        .gte("created_at", `${hoje}T00:00:00`)
        .lte("created_at", `${hoje}T23:59:59`);

      if (count === 15) {
        novosPontos += regras.visita_loja;

        await supabase.from("pontos_historico").insert({
          user_id: user.id,
          tipo: "bonus_visita_loja",
          pontos: regras.visita_loja
        });
      }
    }

    // =========================
    // ATUALIZA USUÁRIO
    // =========================
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ pontos: novosPontos })
      .eq("id", user.id);

    if (updateError) {
      throw updateError; // Joga para o catch lá embaixo
    }

    return res.status(200).json({ pontos: novosPontos });

  } catch (err) {
    // =========================
    // TRATAMENTO DE ERRO GLOBAL
    // =========================
    console.error("Erro interno na API:", err);
    // Retorna JSON válido mesmo em caso de catástrofe, evitando o "Unexpected token A"
    return res.status(500).json({ error: "Erro interno no servidor", details: err.message });
  }
};