export type ReplyType = "positivo" | "dúvida" | "objeção" | "depois" | "indicação" | "ausente" | "descadastro";
type Lang = "pt" | "en" | "es";

// Order matters: the first matching rule wins.
const RULES: Record<Lang, [ReplyType, RegExp][]> = {
  pt: [
    ["descadastro", /\b(sair|descadastr|me tire|remova|não (me )?mande mais|pare de)\b/i],
    ["ausente", /fora do escrit|de férias|ausente até|retorno (no|em) dia|licença/i],
    ["indicação", /\b(fala|fale|procura|procure|escreve|escreva) com\b|quem cuida (disso )?é/i],
    ["depois", /agora não|ano que vem|mais pra frente|mês que vem|daqui a|no momento não/i],
    ["objeção", /já temos|já tenho|não precisamos|sem orçamento|não temos interesse|caro demais/i],
    ["dúvida", /quanto custa|qual o valor|preço|como funciona|\?$/i],
    ["positivo", /pode ser|vamos|topo|tenho interesse|me manda|bora|claro|marcar/i],
  ],
  en: [
    ["descadastro", /\b(unsubscribe|remove me|take me off|stop (emailing|sending)|do not (email|contact))\b/i],
    ["ausente", /out of (the )?office|on vacation|on leave|back on|away until/i],
    ["indicação", /\b(talk|speak|reach out|write) to\b|(handles|in charge of) (that|this)/i],
    ["depois", /not now|next year|later on|next month|in a few (weeks|months)|not at the moment/i],
    ["objeção", /already (have|work with)|we don'?t need|no budget|not interested|too expensive/i],
    ["dúvida", /how much|what('?s| is) the (price|cost)|pricing|how does it work|\?$/i],
    ["positivo", /sounds good|let'?s|i'?m interested|send me|sure|happy to|book/i],
  ],
  es: [
    ["descadastro", /\b(salir|darme de baja|sácame|quítame|no me (escribas|mandes) más|deja de)\b/i],
    ["ausente", /fuera de la oficina|de vacaciones|ausente hasta|vuelvo el|de licencia/i],
    ["indicação", /\b(habla|hable|escribe|escriba|contacta) (con|a)\b|quien (se encarga|lleva) (eso )?es/i],
    ["depois", /ahora no|el año que viene|más adelante|el mes que viene|dentro de|por el momento no/i],
    ["objeção", /ya tenemos|ya tengo|no necesitamos|sin presupuesto|no nos interesa|muy caro/i],
    ["dúvida", /cuánto cuesta|cuál es el (precio|valor)|precio|cómo funciona|\?$/i],
    ["positivo", /puede ser|vamos|me interesa|mándame|claro|dale|agendar/i],
  ],
};

const POSITIVE_FIRST: Record<Lang, RegExp> = {
  pt: /pode ser|tenho interesse|vamos marcar/i,
  en: /sounds good|i'?m interested|let'?s (talk|meet|book)/i,
  es: /puede ser|me interesa|agendemos/i,
};

export function classify(text: string, lang: Lang = "pt"): ReplyType {
  const t = text.trim();
  // A positive reply with a question (e.g. "send me some times?") stays positive.
  if (POSITIVE_FIRST[lang].test(t)) return "positivo";
  for (const [type, re] of RULES[lang]) if (re.test(t)) return type;
  return "dúvida";
}

export const SAMPLE_REPLIES: Record<Lang, string[]> = {
  pt: [
    "Pode ser, me manda horários na terça?",
    "Quanto custa mais ou menos uma página assim?",
    "Agora não, talvez no começo do ano.",
    "Fala com a Bia, ela cuida do marketing aqui.",
    "Estou fora do escritório até dia 25.",
    "Por favor me tire da lista.",
  ],
  en: [
    "Sounds good, can you send me some times on Tuesday?",
    "Roughly how much does a page like that cost?",
    "Not now, maybe early next year.",
    "Talk to Bea, she handles marketing here.",
    "I am out of the office until the 25th.",
    "Please remove me from your list.",
  ],
  es: [
    "Puede ser, ¿me mandas horarios el martes?",
    "¿Cuánto cuesta más o menos una página así?",
    "Ahora no, quizás a principios de año.",
    "Habla con Bea, ella lleva el marketing aquí.",
    "Estoy fuera de la oficina hasta el 25.",
    "Por favor, quítame de la lista.",
  ],
};
