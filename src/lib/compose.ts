import type { Prospect, Sender } from "./data";

export type Tone = "direto" | "caloroso" | "curioso";
export type Email = { subject: string; body: string };
export type Step = Email & { day: number; angle: string };

const OPTOUT = "Se não quer receber esse tipo de e-mail, é só responder “sair” que eu não escrevo mais.";

const subjectFor = (p: Prospect) =>
  (p.topic ?? `site da ${p.company.split(" ")[0]}`).toLowerCase().split(" ").slice(0, 4).join(" ");

export function compose(p: Prospect, s: Sender, tone: Tone = "direto"): Email {
  const open = {
    direto: `Oi ${p.first}, vi que vocês ${p.signal}.`,
    caloroso: `Oi ${p.first}, parabéns, vi que vocês ${p.signal}.`,
    curioso: `Oi ${p.first}, vi que vocês ${p.signal} e fiquei curioso com uma coisa.`,
  }[tone];
  const ask = {
    direto: "Faz sentido eu te mandar uma ideia de como ficaria?",
    caloroso: "Se fizer sentido, te mando um rascunho de como ficaria, sem compromisso.",
    curioso: "Isso já está no radar de vocês?",
  }[tone];
  const body = [
    open,
    `Em geral, quando isso acontece, ${p.problem}. Dá para resolver sem refazer tudo.`,
    `Eu faço ${s.offer}. Num caso parecido, ${s.proof}.`,
    ask,
    `${s.name}\n${s.signature}`,
    OPTOUT,
  ].join("\n\n");
  return { subject: subjectFor(p), body };
}

export function sequence(p: Prospect, s: Sender): Step[] {
  const first = compose(p, s);
  return [
    { ...first, day: 0, angle: "observação" },
    {
      day: 3, angle: "prova", subject: first.subject,
      body: `Oi ${p.first}, complementando: na Clínica Lume o problema era parecido. Trocamos a página de entrada e colocamos o agendamento no topo. Em dois meses os pedidos pelo site triplicaram.\n\nPosso te mostrar o antes e depois?\n\n${s.name}\n\n${OPTOUT}`,
    },
    {
      day: 7, angle: "recurso", subject: `ideia para ${p.company.split(" ")[0].toLowerCase()}`,
      body: `Oi ${p.first}, fiz uma lista curta com três ajustes que dá para aplicar no site da ${p.company} esta semana, mesmo sem me contratar. Quer que eu mande?\n\n${s.name}\n\n${OPTOUT}`,
    },
    {
      day: 14, angle: "despedida", subject: "fecho por aqui",
      body: `Oi ${p.first}, não quero lotar sua caixa, então este é o último. Se um dia o site virar prioridade, é só responder este e-mail.\n\nBoa sorte com a fase nova.\n\n${s.name}`,
    },
  ];
}
