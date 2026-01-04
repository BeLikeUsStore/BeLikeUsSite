import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { userId, tipo } = req.body;

  if (!userId || !tipo) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  let pontos = 0;

  // regras de pontuação
  if (tipo === "afiliado") pontos = 10;
  if (tipo === "leitura") pontos = 5;

  if (pontos === 0) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  try {
    // busca pontos atuais
    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("pontos")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const novosPontos = usuario.pontos + pontos;

    // atualiza pontos
    await supabase
      .from("usuarios")
      .update({ pontos: novosPontos })
      .eq("id", userId);

    return res.status(200).json({ pontos: novosPontos });

  } catch (err) {
    return res.status(500).json({ error: "Erro ao somar pontos" });
  }
}