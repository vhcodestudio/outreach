export type Issue = { start: number; end: number; rule: string; message: string };
type Lang = "pt" | "en" | "es";
type Rule = { rule: string; re: RegExp; message: string; weight: number };

const RULES: Record<Lang, Rule[]> = {
  pt: [
    { rule: "opener", weight: 18, re: /espero que (esteja|estejam|você esteja) bem|meu nome é [^.]+ e (eu )?trabalho|vi seu perfil|me deparei com/gi, message: "Abertura de template. Comece pelo mundo da pessoa." },
    { rule: "dash", weight: 6, re: /\s[—–]\s?/g, message: "Travessão é marca registrada de texto de IA. Use ponto ou vírgula." },
    { rule: "contrast", weight: 14, re: /não (é|se trata) (sobre |de )?[^,.]{1,40}, (é|mas) (sobre )?/gi, message: "Contraste “não é X, é Y” soa fabricado." },
    { rule: "reveal", weight: 12, re: /(o resultado|a solução|o segredo|a verdade)\?/gi, message: "Pergunta respondida por você mesmo. Diga direto." },
    { rule: "stock", weight: 10, re: /pergunta rápida|vou ser sincero|sendo bem honesto|o ponto é o seguinte|diga adeus a|leve .{0,20} ao próximo nível|desbloqueie/gi, message: "Frase pronta. Corte ou diga com suas palavras." },
    { rule: "jargon", weight: 8, re: /sinergi\w*|alavanc\w*|soluções? de ponta|líder de mercado|best-in-class|disruptiv\w*|robust[oa]s?|potencializ\w*/gi, message: "Jargão de vendedor. Troque por algo concreto." },
    { rule: "hype", weight: 6, re: /\b(incrível|revolucionári\w|transformador\w*|game changer)\b/gi, message: "Exagero. Um número convence mais." },
    { rule: "bang", weight: 4, re: /!{1}(?=\s|$)/g, message: "Exclamação em e-mail frio passa ansiedade." },
    { rule: "meeting", weight: 8, re: /reunião de (30|trinta|45|60) minutos|agendar uma call/gi, message: "Pedir 30 min logo no primeiro contato derruba resposta. Pergunte se faz sentido." },
  ],
  en: [
    { rule: "opener", weight: 18, re: /hope (this|my) (email|message) finds you well|i hope you('re| are) (doing )?well|my name is [^.]+ and i|i came across your/gi, message: "Template opener. Start with their world." },
    { rule: "dash", weight: 6, re: /\s[—–]\s?/g, message: "Em dashes are a hallmark of AI text. Use a period or a comma." },
    { rule: "contrast", weight: 14, re: /it'?s not (about )?[^,.]{1,40}, it'?s (about )?/gi, message: "The “it's not X, it's Y” contrast sounds manufactured." },
    { rule: "reveal", weight: 12, re: /(the result|the answer|the secret|the truth)\?/gi, message: "A question you answer yourself. Just say it." },
    { rule: "stock", weight: 10, re: /quick question|to be honest|i'?ll be honest|here'?s the thing|say goodbye to|take .{0,20} to the next level|unlock/gi, message: "Stock phrase. Cut it or say it in your own words." },
    { rule: "jargon", weight: 8, re: /synerg\w*|leverag\w*|cutting-edge|best-in-class|market leader|disrupt\w*|robust|game-changing/gi, message: "Sales jargon. Swap it for something concrete." },
    { rule: "hype", weight: 6, re: /\b(amazing|revolutionary|transformative|game changer|incredible)\b/gi, message: "Overstatement. A number is more convincing." },
    { rule: "bang", weight: 4, re: /!{1}(?=\s|$)/g, message: "An exclamation mark in a cold email reads as anxious." },
    { rule: "meeting", weight: 8, re: /(30|thirty|45|60)-?minute (call|meeting)|schedule a call/gi, message: "Asking for 30 minutes on first contact kills replies. Ask whether it makes sense." },
  ],
  es: [
    { rule: "opener", weight: 18, re: /espero que (estés|esté|estén) bien|mi nombre es [^.]+ y (yo )?trabajo|vi tu perfil|me encontré con/gi, message: "Apertura de plantilla. Empieza por el mundo de la persona." },
    { rule: "dash", weight: 6, re: /\s[—–]\s?/g, message: "La raya es marca registrada del texto de IA. Usa punto o coma." },
    { rule: "contrast", weight: 14, re: /no (es|se trata) (sobre |de )?[^,.]{1,40}, (es|se trata|sino) (de |sobre )?/gi, message: "El contraste “no es X, es Y” suena fabricado." },
    { rule: "reveal", weight: 12, re: /(el resultado|la solución|el secreto|la verdad)\?/gi, message: "Pregunta que respondes tú mismo. Dilo directo." },
    { rule: "stock", weight: 10, re: /pregunta rápida|voy a ser sincero|siendo honesto|la cosa es así|dile adiós a|lleva .{0,20} al siguiente nivel|desbloquea/gi, message: "Frase hecha. Córtala o dila con tus palabras." },
    { rule: "jargon", weight: 8, re: /sinergi\w*|apalanc\w*|potenci\w*|soluciones? de vanguardia|líder del mercado|disruptiv\w*|robust[oa]s?/gi, message: "Jerga de vendedor. Cámbiala por algo concreto." },
    { rule: "hype", weight: 6, re: /\b(increíble|revolucionari\w|transformador\w*|game changer)\b/gi, message: "Exageración. Un número convence más." },
    { rule: "bang", weight: 4, re: /!{1}(?=\s|$)/g, message: "La exclamación en un correo frío transmite ansiedad." },
    { rule: "meeting", weight: 8, re: /(reunión|llamada) de (30|treinta|45|60) minutos|agendar una llamada/gi, message: "Pedir 30 minutos en el primer contacto baja las respuestas. Pregunta si tiene sentido." },
  ],
};

const PRONOUNS: Record<Lang, { you: RegExp; me: RegExp }> = {
  pt: { you: /\b(você|vocês|seu|sua|seus|suas)\b/gi, me: /\b(eu|nós|meu|minha|nosso|nossa)\b/gi },
  en: { you: /\b(you|your|yours)\b/gi, me: /\b(i|we|my|our|me|us)\b/gi },
  es: { you: /\b(tú|tu|tus|usted|ustedes|su|sus)\b/gi, me: /\b(yo|nosotros|mi|mis|nuestro|nuestra)\b/gi },
};

export function lint(text: string, lang: Lang = "pt"): Issue[] {
  const out: Issue[] = [];
  for (const r of RULES[lang]) {
    for (const m of text.matchAll(r.re)) {
      if (m.index === undefined || !m[0].trim()) continue;
      out.push({ start: m.index, end: m.index + m[0].length, rule: r.rule, message: r.message });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

export function humanScore(text: string, lang: Lang = "pt") {
  if (!text.trim()) return 0;
  let s = 100;
  for (const i of lint(text, lang)) s -= RULES[lang].find((r) => r.rule === i.rule)!.weight;
  const words = text.trim().split(/\s+/).length;
  if (words > 140) s -= Math.min(20, Math.round((words - 140) / 5));
  const you = (text.match(PRONOUNS[lang].you) ?? []).length;
  const me = (text.match(PRONOUNS[lang].me) ?? []).length;
  if (me > you + 2) s -= 8;
  return Math.max(0, Math.min(100, s));
}
