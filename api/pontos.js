import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token ausente" });
  }

  const token = authHeader.replace("Bearer ", "");

  // 1️⃣ valida token
  const { data: { user }, error: authError } =
    await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Token inválido" });
  }

  const { tipo } = req.body;

  if (!tipo) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  const regras = {
    login: 5,
    leitura: 5,
    afiliado: 10
  };

  const pontos = regras[tipo];
  if (!pontos) {
    return res.status(400).json({ error: "Tipo não permitido" });
  }

  // 2️⃣ verifica se já ganhou hoje
  const hoje = new Date().toISOString().slice(0, 10);

  const { data: jaGanhou } = await supabase
    .from("pontos_historico")
    .select("id")
    .eq("user_id", user.id)
    .eq("tipo", tipo)
    .gte("created_at", `${hoje}T00:00:00`)
    .lte("created_at", `${hoje}T23:59:59`)
    .maybeSingle();

  if (jaGanhou) {
    return res.status(400).json({ error: "Pontos já recebidos hoje" });
  }

  // 3️⃣ registra histórico
  await supabase.from("pontos_historico").insert({
    user_id: user.id,
    tipo,
    pontos
  });

  // 4️⃣ soma pontos no perfil
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("pontos")
    .eq("id", user.id)
    .single();

  const novosPontos = usuario.pontos + pontos;

  await supabase
    .from("usuarios")
    .update({ pontos: novosPontos })
    .eq("id", user.id);

  return res.status(200).json({ pontos: novosPontos });
}