import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error } = await supabase.auth.getUser(token);

  if (error || !userData.user) {
    return res.status(401).json({ error: "Sessão inválida" });
  }

  const userId = userData.user.id;
  const { tipo } = req.body;

  let pontos = 0;
  if (tipo === "leitura") pontos = 5;
  if (tipo === "afiliado") pontos = 10;

  if (pontos === 0) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("pontos")
    .eq("id", userId)
    .single();

  const novosPontos = usuario.pontos + pontos;

  await supabase
    .from("usuarios")
    .update({ pontos: novosPontos })
    .eq("id", userId);

  return res.status(200).json({ pontos: novosPontos });
}