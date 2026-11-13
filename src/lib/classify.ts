export type ReplyType = "positivo" | "dúvida" | "objeção" | "depois" | "indicação" | "ausente" | "descadastro";

const RULES: [ReplyType, RegExp][] = [
  ["descadastro", /\b(sair|descadastr|me tire|remova|não (me )?mande mais|pare de)\b/i],
  ["ausente", /fora do escrit|de férias|ausente até|retorno (no|em) dia|licença/i],
  ["indicação", /\b(fala|fale|procura|procure|escreve|escreva) com\b|quem cuida (disso )?é/i],
  ["depois", /agora não|ano que vem|mais pra frente|mês que vem|daqui a|no momento não/i],
  ["objeção", /já temos|já tenho|não precisamos|sem orçamento|não temos interesse|caro demais/i],
  ["dúvida", /quanto custa|qual o valor|preço|como funciona|\?$/i],
  ["positivo", /pode ser|vamos|topo|tenho interesse|me manda|bora|claro|marcar/i],
];

export function classify(text: string): ReplyType {
  const t = text.trim();
  // positive with a question (e.g. "me manda horários?") should stay positive
  if (/pode ser|tenho interesse|vamos marcar/i.test(t)) return "positivo";
  for (const [type, re] of RULES) if (re.test(t)) return type;
  return "dúvida";
}

export const REPLY_LABEL: Record<ReplyType, string> = {
  positivo: "Interessado", dúvida: "Pediu informação", objeção: "Objeção", depois: "Agora não",
  indicação: "Indicou alguém", ausente: "Fora do escritório", descadastro: "Pediu para sair",
};
