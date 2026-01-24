const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // AUTH
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token ausente" });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return res.status(401).json({ error: "Token inválido" });

    const { tipo, produto_id } = req.body;
    const hoje = new Date().toISOString().slice(0, 10);

    const regras = {
      login_diario: 50,
      ler_artigo: 20,
      visita_loja: 150
    };

    if (!regras[tipo]) return res.status(400).json({ error: "Tipo não permitido" });

    // BUSCA USUÁRIO
    const { data: usuario, error: userError } = await supabase
      .from("usuarios")
      .select("pontos")
      .eq("id", user.id)
      .single();

    if (userError || !usuario) return res.status(404).json({ error: "Perfil não encontrado." });

    let novosPontos = usuario.pontos || 0;

    // ==========================================
    // LOGICA: LOGIN / ARTIGO
    // ==========================================
    if (tipo === "login_diario" || tipo === "ler_artigo") {
      const { data: jaGanhou } = await supabase
        .from("pontos_historico")
        .select("id")
        .eq("user_id", user.id)
        .eq("tipo", tipo)
        .gte("created_at", `${hoje}T00:00:00`)
        .lte("created_at", `${hoje}T23:59:59`)
        .maybeSingle();

      if (jaGanhou) return res.status(400).json({ error: "Já recebido hoje" });

      novosPontos += regras[tipo];

      await supabase.from("pontos_historico").insert({
        user_id: user.id,
        tipo,
        pontos: regras[tipo]
      });
    }

    // ==========================================
    // LOGICA: VISITA LOJA (0/15)
    // ==========================================
    if (tipo === "visita_loja") {
      if (!produto_id) return res.status(400).json({ error: "Produto inválido" });

      // 1. Verifica se já atingiu a meta de bônus hoje para não gastar processamento
      const { data: jaGanhouBonus } = await supabase
        .from("pontos_historico")
        .select("id")
        .eq("user_id", user.id)
        .eq("tipo", "bonus_visita_loja")
        .gte("created_at", `${hoje}T00:00:00`)
        .lte("created_at", `${hoje}T23:59:59`)
        .maybeSingle();

      if (jaGanhouBonus) {
        return res.status(200).json({ status: "limite_diario_atingido", pontos: novosPontos });
      }

      // 2. Verifica se este produto específico já foi contado
      const { data: jaVisitouEste } = await supabase
        .from("pontos_historico")
        .select("id")
        .eq("user_id", user.id)
        .eq("tipo", "visita_loja")
        .eq("produto_id", String(produto_id))
        .gte("created_at", `${hoje}T00:00:00`)
        .lte("created_at", `${hoje}T23:59:59`)
        .maybeSingle();

      if (jaVisitouEste) {
        return res.status(200).json({ status: "produto_ja_contado", pontos: novosPontos });
      }

      // 3. Registra a visita inédita
      await supabase.from("pontos_historico").insert({
        user_id: user.id,
        tipo: "visita_loja",
        produto_id: String(produto_id)
      });

      // 4. Conta quantas visitas ele tem hoje
      const { count } = await supabase
        .from("pontos_historico")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("tipo", "visita_loja")
        .gte("created_at", `${hoje}T00:00:00`)
        .lte("created_at", `${hoje}T23:59:59`);

      // 5. Se bateu 15, dá o bônus
      if (count === 15) {
        novosPontos += regras.visita_loja;
        await supabase.from("pontos_historico").insert({
          user_id: user.id,
          tipo: "bonus_visita_loja",
          pontos: regras.visita_loja
        });
      }
    }

    // ATUALIZA PONTOS NO PERFIL
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ pontos: novosPontos })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return res.status(200).json({ pontos: novosPontos });

  } catch (err) {
    console.error("Erro na API:", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
};