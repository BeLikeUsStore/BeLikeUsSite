import { createClient } from "@supabase/supabase-js";

// cria cliente supabase usando SERVICE ROLE (somente na API)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // 1. método permitido
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // 2. pega o token do header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  const token = authHeader.replace("Bearer ", "");

  // 3. valida token e pega usuário
  const { data: { user }, error: authError } =
    await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }

  // 4. lê o tipo de ação
  const { tipo } = req.body;

  if (!tipo) {
    return res.status(400).json({ error: "Tipo não informado" });
  }

  // 5. regras de pontuação
  let pontos = 0;

  if (tipo === "login") pontos = 50;
  if (tipo === "leitura") pontos = 20;
  if (tipo === "loja") pontos = 150;
  if (tipo === "cadastro") pontos = 75;
  if (tipo === "compartilhar") pontos = 90;

  if (pontos === 0) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  // 6. busca pontos atuais
  const { data: usuario, error: fetchError } = await supabase
    .from("usuarios")
    .select("pontos")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }

  const novosPontos = usuario.pontos + pontos;

  // 7. atualiza pontos
  const { error: updateError } = await supabase
    .from("usuarios")
    .update({ pontos: novosPontos })
    .eq("id", user.id);

  if (updateError) {
    return res.status(500).json({ error: "Erro ao atualizar pontos" });
  }

  // 8. retorna novo saldo
  return res.status(200).json({ pontos: novosPontos });
}