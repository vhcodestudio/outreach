"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const LANGS = ["pt", "en", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const langLabel: Record<Lang, string> = { pt: "Português", en: "English", es: "Español" };
const HTML_LANG: Record<Lang, string> = { pt: "pt-BR", en: "en", es: "es" };
const KEY = "outreach:lang";
export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

/** ?lang= wins, then the saved choice, then the browser language. Runs after mount (SSR renders Portuguese). */
function detect(): Lang {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (isLang(q)) return q;
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) return saved;
  } catch { /* storage blocked */ }
  const nav = navigator.language.toLowerCase();
  return nav.startsWith("es") ? "es" : nav.startsWith("en") ? "en" : "pt";
}

export function useLangState() {
  const [lang, setLang] = useState<Lang>("pt");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- read the browser language after hydration
  useEffect(() => setLang(detect()), []);
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
    document.title = ui[lang].title;
    try { localStorage.setItem(KEY, lang); } catch { /* storage blocked */ }
  }, [lang]);
  return [lang, setLang] as const;
}

const pt = {
  title: "outreach — CRM de prospecção para freelancers",
  locale: "pt-BR", currency: "BRL",
  language: "Idioma", demo: "modo demo", sections: "Seções",
  views: ["Funil", "Prospects", "Escrever", "Sequências", "Respostas"],
  writeTitle: "Escrever e-mail",
  sub: [
    "Arraste os envelopes entre as etapas, ou use o menu de cada um.",
    "Sua lista. Importe um CSV ou exporte o que já tem.",
    "Um rascunho a partir do sinal que você anotou. O revisor marca o que soa robótico.",
    "Follow-ups com um ângulo novo em cada toque. Param sozinhos quando a pessoa responde.",
    "Cada resposta é classificada para você saber o que fazer primeiro.",
  ],
  open: "Em aberto", replyRate: "Taxa de resposta", reset: "Restaurar dados de exemplo",
  stages: { novo: "Novos", contatado: "Contatados", respondeu: "Responderam", reuniao: "Reunião", fechado: "Fechados", perdido: "Perdidos" },
  moveTo: (c: string) => `Mover ${c} para`, dropHere: "Solte um envelope aqui",
  all: "todos", search: "Buscar", searchPh: "Buscar nome, empresa, e-mail", segment: "Segmento",
  importCsv: "Importar CSV", exportCsv: "Exportar CSV", tooBig: "Arquivo grande demais (máx. 1 MB).",
  imported: (n: number) => `${n} prospects importados.`,
  noRows: "Nenhuma linha com e-mail válido. Colunas esperadas: nome, empresa, email, segmento, sinal.",
  cols: ["Contato", "Sinal", "Etapa", "Valor", "Último toque"], noMatch: "Ninguém com esse filtro.",
  noSeq: "Mande o primeiro e-mail para alguém e a sequência aparece aqui.",
  stoppedReplied: "parada · respondeu", running: "em andamento",
  stoppedNote: (n: string) => `${n} respondeu, então os próximos toques foram cancelados em todos os canais.`,
  day: "dia",
  next: {
    positivo: "Responda em minutos com dois horários e um link de agenda.",
    dúvida: "Responda a pergunta em duas linhas e devolva com um pedido simples.",
    indicação: "Agradeça e escreva para a pessoa indicada citando quem indicou.",
    objeção: "Agradeça, deixe a porta aberta e encerre a sequência.",
    depois: "Anote para voltar na data que a pessoa sugeriu.",
    ausente: "Nada a fazer. O próximo toque sai depois da volta.",
    descadastro: "Remova da lista e confirme. Não escreva de novo.",
  },
  replyLabel: {
    positivo: "Interessado", dúvida: "Pediu informação", objeção: "Objeção", depois: "Agora não",
    indicação: "Indicou alguém", ausente: "Fora do escritório", descadastro: "Pediu para sair",
  },
  newReply: "Nova resposta chegou.", nobody: "Ninguém em “Contatados” para responder. Mande um e-mail antes.",
  simulate: "Simular resposta", noReplies: "Nenhuma resposta ainda.",
  composer: {
    humanish: "soa humano", to: "Para", tone: "Tom", tones: { direto: "direto", caloroso: "caloroso", curioso: "curioso" },
    subject: "Assunto", body: "Corpo do e-mail", words: (w: number, s: number) => `${w} palavras · ${s} no assunto`,
    again: "Gerar de novo", sent: "Enviado (demo) ✓", send: "Enviar (demo)",
    demoNote: "Modo demo: nada sai daqui. “Enviar” só registra o contato e move o prospect no funil.",
    robot: ["ver um e-mail", "robótico"], reviewer: "Revisor de tom", clean: "Nada soando como template. Pode mandar.",
    why: "Por que esse e-mail", signal: "Sinal:", pain: "Dor provável:",
    tips: ["Assunto curto e em minúsculas, como e-mail de colega.", "Um pedido só, fácil de responder com uma linha.", "Linha de descadastro no fim."],
  },
};
export type UI = typeof pt;

const en: UI = {
  title: "outreach — prospecting CRM for freelancers",
  locale: "en-US", currency: "USD",
  language: "Language", demo: "demo mode", sections: "Sections",
  views: ["Pipeline", "Prospects", "Write", "Sequences", "Replies"],
  writeTitle: "Write an email",
  sub: [
    "Drag the envelopes between stages, or use the menu on each one.",
    "Your list. Import a CSV or export what you have.",
    "A draft built from the signal you noted. The reviewer flags whatever sounds robotic.",
    "Follow-ups with a new angle on each touch. They stop on their own when the person replies.",
    "Every reply is classified so you know what to handle first.",
  ],
  open: "Open pipeline", replyRate: "Reply rate", reset: "Restore sample data",
  stages: { novo: "New", contatado: "Contacted", respondeu: "Replied", reuniao: "Meeting", fechado: "Won", perdido: "Lost" },
  moveTo: (c) => `Move ${c} to`, dropHere: "Drop an envelope here",
  all: "all", search: "Search", searchPh: "Search name, company, email", segment: "Segment",
  importCsv: "Import CSV", exportCsv: "Export CSV", tooBig: "File too large (max 1 MB).",
  imported: (n) => `${n} prospects imported.`,
  noRows: "No rows with a valid email. Expected columns: name, company, email, segment, signal.",
  cols: ["Contact", "Signal", "Stage", "Value", "Last touch"], noMatch: "Nobody matches that filter.",
  noSeq: "Send the first email to someone and the sequence shows up here.",
  stoppedReplied: "stopped · replied", running: "running",
  stoppedNote: (n) => `${n} replied, so the next touches were cancelled on every channel.`,
  day: "day",
  next: {
    positivo: "Reply within minutes with two time slots and a booking link.",
    dúvida: "Answer the question in two lines and come back with one simple ask.",
    indicação: "Say thanks and write to the referred person, mentioning who sent you.",
    objeção: "Say thanks, leave the door open and end the sequence.",
    depois: "Note it down to follow up on the date they suggested.",
    ausente: "Nothing to do. The next touch goes out after they are back.",
    descadastro: "Remove them from the list and confirm. Do not write again.",
  },
  replyLabel: {
    positivo: "Interested", dúvida: "Asked for info", objeção: "Objection", depois: "Not now",
    indicação: "Referred someone", ausente: "Out of office", descadastro: "Unsubscribed",
  },
  newReply: "A new reply came in.", nobody: "Nobody in “Contacted” to reply. Send an email first.",
  simulate: "Simulate a reply", noReplies: "No replies yet.",
  composer: {
    humanish: "sounds human", to: "To", tone: "Tone", tones: { direto: "direct", caloroso: "warm", curioso: "curious" },
    subject: "Subject", body: "Email body", words: (w, s) => `${w} words · ${s} in the subject`,
    again: "Generate again", sent: "Sent (demo) ✓", send: "Send (demo)",
    demoNote: "Demo mode: nothing leaves this page. “Send” only logs the contact and moves the prospect in the pipeline.",
    robot: ["see a robotic", "email"], reviewer: "Tone reviewer", clean: "Nothing sounds like a template. Good to send.",
    why: "Why this email", signal: "Signal:", pain: "Likely pain:",
    tips: ["Short lowercase subject, like an email from a colleague.", "One ask only, easy to answer in one line.", "Unsubscribe line at the end."],
  },
};

const es: UI = {
  title: "outreach — CRM de prospección para freelancers",
  locale: "es-ES", currency: "USD",
  language: "Idioma", demo: "modo demo", sections: "Secciones",
  views: ["Embudo", "Prospectos", "Escribir", "Secuencias", "Respuestas"],
  writeTitle: "Escribir correo",
  sub: [
    "Arrastra los sobres entre etapas o usa el menú de cada uno.",
    "Tu lista. Importa un CSV o exporta lo que ya tienes.",
    "Un borrador a partir de la señal que anotaste. El revisor marca lo que suena a robot.",
    "Seguimientos con un ángulo nuevo en cada toque. Se detienen solos cuando la persona responde.",
    "Cada respuesta se clasifica para que sepas qué atender primero.",
  ],
  open: "En curso", replyRate: "Tasa de respuesta", reset: "Restaurar datos de ejemplo",
  stages: { novo: "Nuevos", contatado: "Contactados", respondeu: "Respondieron", reuniao: "Reunión", fechado: "Cerrados", perdido: "Perdidos" },
  moveTo: (c) => `Mover ${c} a`, dropHere: "Suelta un sobre aquí",
  all: "todos", search: "Buscar", searchPh: "Buscar nombre, empresa, correo", segment: "Segmento",
  importCsv: "Importar CSV", exportCsv: "Exportar CSV", tooBig: "Archivo demasiado grande (máx. 1 MB).",
  imported: (n) => `${n} prospectos importados.`,
  noRows: "Ninguna fila con correo válido. Columnas esperadas: nombre, empresa, email, segmento, señal.",
  cols: ["Contacto", "Señal", "Etapa", "Valor", "Último toque"], noMatch: "Nadie con ese filtro.",
  noSeq: "Envía el primer correo a alguien y la secuencia aparece aquí.",
  stoppedReplied: "detenida · respondió", running: "en curso",
  stoppedNote: (n) => `${n} respondió, así que los próximos toques se cancelaron en todos los canales.`,
  day: "día",
  next: {
    positivo: "Responde en minutos con dos horarios y un enlace de agenda.",
    dúvida: "Responde la pregunta en dos líneas y vuelve con un pedido simple.",
    indicação: "Agradece y escribe a la persona indicada mencionando quién te la recomendó.",
    objeção: "Agradece, deja la puerta abierta y cierra la secuencia.",
    depois: "Anótalo para volver en la fecha que sugirió.",
    ausente: "Nada que hacer. El próximo toque sale después de su regreso.",
    descadastro: "Quítalo de la lista y confirma. No vuelvas a escribir.",
  },
  replyLabel: {
    positivo: "Interesado", dúvida: "Pidió información", objeção: "Objeción", depois: "Ahora no",
    indicação: "Recomendó a alguien", ausente: "Fuera de la oficina", descadastro: "Pidió salir",
  },
  newReply: "Llegó una nueva respuesta.", nobody: "Nadie en “Contactados” para responder. Envía un correo antes.",
  simulate: "Simular respuesta", noReplies: "Aún no hay respuestas.",
  composer: {
    humanish: "suena humano", to: "Para", tone: "Tono", tones: { direto: "directo", caloroso: "cálido", curioso: "curioso" },
    subject: "Asunto", body: "Cuerpo del correo", words: (w, s) => `${w} palabras · ${s} en el asunto`,
    again: "Generar de nuevo", sent: "Enviado (demo) ✓", send: "Enviar (demo)",
    demoNote: "Modo demo: nada sale de aquí. “Enviar” solo registra el contacto y mueve al prospecto en el embudo.",
    robot: ["ver un correo", "robótico"], reviewer: "Revisor de tono", clean: "Nada suena a plantilla. Puedes enviarlo.",
    why: "Por qué este correo", signal: "Señal:", pain: "Dolor probable:",
    tips: ["Asunto corto y en minúsculas, como correo de un colega.", "Un solo pedido, fácil de responder en una línea.", "Línea para darse de baja al final."],
  },
};

export const ui: Record<Lang, UI> = { pt, en, es };

export const LangContext = createContext<{ lang: Lang; t: UI }>({ lang: "pt", t: pt });
export const useLang = () => useContext(LangContext);
