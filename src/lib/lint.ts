export type Issue = { start: number; end: number; rule: string; message: string };

const RULES: { rule: string; re: RegExp; message: string; weight: number }[] = [
  { rule: "opener", weight: 18, re: /espero que (esteja|estejam|você esteja) bem|meu nome é [^.]+ e (eu )?trabalho|vi seu perfil|me deparei com/gi, message: "Abertura de template. Comece pelo mundo da pessoa." },
  { rule: "dash", weight: 6, re: /\s[—–]\s?/g, message: "Travessão é marca registrada de texto de IA. Use ponto ou vírgula." },
  { rule: "contrast", weight: 14, re: /não (é|se trata) (sobre |de )?[^,.]{1,40}, (é|mas) (sobre )?/gi, message: "Contraste “não é X, é Y” soa fabricado." },
  { rule: "reveal", weight: 12, re: /(o resultado|a solução|o segredo|a verdade)\?/gi, message: "Pergunta respondida por você mesmo. Diga direto." },
  { rule: "stock", weight: 10, re: /pergunta rápida|vou ser sincero|sendo bem honesto|o ponto é o seguinte|diga adeus a|leve .{0,20} ao próximo nível|desbloqueie/gi, message: "Frase pronta. Corte ou diga com suas palavras." },
  { rule: "jargon", weight: 8, re: /sinergi\w*|alavanc\w*|soluções? de ponta|líder de mercado|best-in-class|disruptiv\w*|robust[oa]s?|potencializ\w*/gi, message: "Jargão de vendedor. Troque por algo concreto." },
  { rule: "hype", weight: 6, re: /\b(incrível|revolucionári\w|transformador\w*|game changer)\b/gi, message: "Exagero. Um número convence mais." },
  { rule: "bang", weight: 4, re: /!{1}(?=\s|$)/g, message: "Exclamação em e-mail frio passa ansiedade." },
  { rule: "meeting", weight: 8, re: /reunião de (30|trinta|45|60) minutos|agendar uma call/gi, message: "Pedir 30 min logo no primeiro contato derruba resposta. Pergunte se faz sentido." },
];

export function lint(text: string): Issue[] {
  const out: Issue[] = [];
  for (const r of RULES) {
    for (const m of text.matchAll(r.re)) {
      if (m.index === undefined || !m[0].trim()) continue;
      out.push({ start: m.index, end: m.index + m[0].length, rule: r.rule, message: r.message });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

export function humanScore(text: string) {
  if (!text.trim()) return 0;
  let s = 100;
  for (const i of lint(text)) s -= RULES.find((r) => r.rule === i.rule)!.weight;
  const words = text.trim().split(/\s+/).length;
  if (words > 140) s -= Math.min(20, Math.round((words - 140) / 5));
  const you = (text.match(/\b(você|vocês|seu|sua|seus|suas)\b/gi) ?? []).length;
  const me = (text.match(/\b(eu|nós|meu|minha|nosso|nossa)\b/gi) ?? []).length;
  if (me > you + 2) s -= 8;
  return Math.max(0, Math.min(100, s));
}
