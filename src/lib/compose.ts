import type { Prospect, Sender } from "./data";

export type Tone = "direto" | "caloroso" | "curioso";
export type Email = { subject: string; body: string };
export type Step = Email & { day: number; angle: string };
type Lang = "pt" | "en" | "es";

type Copy = {
  optout: string;
  subject: (company: string) => string;
  open: Record<Tone, (first: string, signal: string) => string>;
  ask: Record<Tone, string>;
  problem: (problem: string) => string;
  offer: (offer: string, proof: string) => string;
  angles: [string, string, string, string];
  proofStep: (first: string) => string;
  resourceSubject: (company: string) => string;
  resourceStep: (first: string, company: string) => string;
  byeSubject: string;
  byeStep: (first: string) => string;
};

const COPY: Record<Lang, Copy> = {
  pt: {
    optout: "Se não quer receber esse tipo de e-mail, é só responder “sair” que eu não escrevo mais.",
    subject: (c) => `site da ${c}`,
    open: {
      direto: (f, s) => `Oi ${f}, vi que vocês ${s}.`,
      caloroso: (f, s) => `Oi ${f}, parabéns, vi que vocês ${s}.`,
      curioso: (f, s) => `Oi ${f}, vi que vocês ${s} e fiquei curioso com uma coisa.`,
    },
    ask: {
      direto: "Faz sentido eu te mandar uma ideia de como ficaria?",
      caloroso: "Se fizer sentido, te mando um rascunho de como ficaria, sem compromisso.",
      curioso: "Isso já está no radar de vocês?",
    },
    problem: (p) => `Em geral, quando isso acontece, ${p}. Dá para resolver sem refazer tudo.`,
    offer: (o, pr) => `Eu faço ${o}. Num caso parecido, ${pr}.`,
    angles: ["observação", "prova", "recurso", "despedida"],
    proofStep: (f) => `Oi ${f}, complementando: na Clínica Lume o problema era parecido. Trocamos a página de entrada e colocamos o agendamento no topo. Em dois meses os pedidos pelo site triplicaram.\n\nPosso te mostrar o antes e depois?`,
    resourceSubject: (c) => `ideia para ${c}`,
    resourceStep: (f, c) => `Oi ${f}, fiz uma lista curta com três ajustes que dá para aplicar no site da ${c} esta semana, mesmo sem me contratar. Quer que eu mande?`,
    byeSubject: "fecho por aqui",
    byeStep: (f) => `Oi ${f}, não quero lotar sua caixa, então este é o último. Se um dia o site virar prioridade, é só responder este e-mail.\n\nBoa sorte com a fase nova.`,
  },
  en: {
    optout: "If you would rather not get emails like this, just reply “stop” and I will not write again.",
    subject: (c) => `${c} website`,
    open: {
      direto: (f, s) => `Hi ${f}, I saw that you ${s}.`,
      caloroso: (f, s) => `Hi ${f}, congrats, I saw that you ${s}.`,
      curioso: (f, s) => `Hi ${f}, I saw that you ${s} and got curious about one thing.`,
    },
    ask: {
      direto: "Would it make sense if I sent you an idea of how it could look?",
      caloroso: "If it makes sense, I can send you a draft of how it could look, no strings attached.",
      curioso: "Is that already on your radar?",
    },
    problem: (p) => `Usually, when that happens, ${p}. It can be fixed without redoing everything.`,
    offer: (o, pr) => `I build ${o}. In a similar case, ${pr}.`,
    angles: ["observation", "proof", "resource", "breakup"],
    proofStep: (f) => `Hi ${f}, one more thing: Lume Clinic had a similar problem. We changed the landing page and put booking at the top. In two months, requests through the site tripled.\n\nCan I show you the before and after?`,
    resourceSubject: (c) => `idea for ${c}`,
    resourceStep: (f, c) => `Hi ${f}, I put together a short list of three fixes you could apply to the ${c} site this week, even without hiring me. Want me to send it?`,
    byeSubject: "closing the loop",
    byeStep: (f) => `Hi ${f}, I do not want to crowd your inbox, so this is the last one. If the site ever becomes a priority, just reply to this email.\n\nGood luck with the new phase.`,
  },
  es: {
    optout: "Si no quieres recibir este tipo de correos, responde “salir” y no vuelvo a escribir.",
    subject: (c) => `sitio de ${c}`,
    open: {
      direto: (f, s) => `Hola ${f}, vi que ${s}.`,
      caloroso: (f, s) => `Hola ${f}, felicidades, vi que ${s}.`,
      curioso: (f, s) => `Hola ${f}, vi que ${s} y me quedó una curiosidad.`,
    },
    ask: {
      direto: "¿Tiene sentido que te mande una idea de cómo quedaría?",
      caloroso: "Si tiene sentido, te mando un borrador de cómo quedaría, sin compromiso.",
      curioso: "¿Eso ya está en su radar?",
    },
    problem: (p) => `En general, cuando pasa eso, ${p}. Se puede resolver sin rehacer todo.`,
    offer: (o, pr) => `Hago ${o}. En un caso parecido, ${pr}.`,
    angles: ["observación", "prueba", "recurso", "despedida"],
    proofStep: (f) => `Hola ${f}, para completar: en la Clínica Lume el problema era parecido. Cambiamos la página de inicio y pusimos la reserva arriba. En dos meses los pedidos por el sitio se triplicaron.\n\n¿Te muestro el antes y el después?`,
    resourceSubject: (c) => `idea para ${c}`,
    resourceStep: (f, c) => `Hola ${f}, armé una lista corta con tres ajustes que se pueden aplicar al sitio de ${c} esta semana, incluso sin contratarme. ¿Te la mando?`,
    byeSubject: "cierro por aquí",
    byeStep: (f) => `Hola ${f}, no quiero llenar tu bandeja, así que este es el último. Si algún día el sitio se vuelve prioridad, solo responde este correo.\n\nSuerte con la nueva etapa.`,
  },
};

const shortName = (company: string) => company.split(" ")[0];

const subjectFor = (p: Prospect, c: Copy) =>
  (p.topic ?? c.subject(shortName(p.company))).toLowerCase().split(" ").slice(0, 4).join(" ");

export function compose(p: Prospect, s: Sender, tone: Tone = "direto", lang: Lang = "pt"): Email {
  const c = COPY[lang];
  const body = [
    c.open[tone](p.first, p.signal),
    c.problem(p.problem),
    c.offer(s.offer, s.proof),
    c.ask[tone],
    `${s.name}\n${s.signature}`,
    c.optout,
  ].join("\n\n");
  return { subject: subjectFor(p, c), body };
}

export function sequence(p: Prospect, s: Sender, lang: Lang = "pt"): Step[] {
  const c = COPY[lang];
  const first = compose(p, s, "direto", lang);
  return [
    { ...first, day: 0, angle: c.angles[0] },
    { day: 3, angle: c.angles[1], subject: first.subject, body: `${c.proofStep(p.first)}\n\n${s.name}\n\n${c.optout}` },
    { day: 7, angle: c.angles[2], subject: c.resourceSubject(shortName(p.company).toLowerCase()), body: `${c.resourceStep(p.first, p.company)}\n\n${s.name}\n\n${c.optout}` },
    { day: 14, angle: c.angles[3], subject: c.byeSubject, body: `${c.byeStep(p.first)}\n\n${s.name}` },
  ];
}

/** A deliberately bad email, used to show what the reviewer catches. */
export const ROBOTIC: Record<Lang, (first: string) => string> = {
  pt: (f) => `Olá ${f}! Espero que esteja bem.\n\nPergunta rápida: não é sobre ter um site, é sobre ter resultados — e nós podemos alavancar sua presença digital com soluções de ponta.\n\nPodemos agendar uma call de 30 minutos?`,
  en: (f) => `Hello ${f}! I hope this email finds you well.\n\nQuick question: it's not about having a website, it's about getting results — and we can leverage your digital presence with cutting-edge solutions.\n\nCan we schedule a 30-minute call?`,
  es: (f) => `¡Hola ${f}! Espero que estés bien.\n\nPregunta rápida: no se trata de tener un sitio, se trata de tener resultados — y podemos potenciar tu presencia digital con soluciones de vanguardia.\n\n¿Podemos agendar una llamada de 30 minutos?`,
};
