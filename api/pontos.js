import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
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

  const { data: { user }, error: authError } =
    await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Token inválido" });
  }

  const { tipo, produto_id } = req.body;

  // =========================
  // REGRAS FIXAS
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
  // BUSCA USUÁRIO
  // =========================
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("pontos")
    .eq("id", user.id)
    .single();

  let novosPontos = usuario.pontos;

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

    // já visitou este produto hoje?
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
      return res.status(200).json({ status: "produto_ja_contado" });
    }

    // registra visita
    await supabase.from("pontos_historico").insert({
      user_id: user.id,
      tipo: "visita_loja",
      produto_id
    });

    // conta produtos únicos hoje
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
  await supabase
    .from("usuarios")
    .update({ pontos: novosPontos })
    .eq("id", user.id);

  return res.status(200).json({ pontos: novosPontos });
}
