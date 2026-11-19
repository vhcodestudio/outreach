import { describe, expect, it } from "vitest";
import { lint, humanScore } from "./lint";
import { compose, sequence } from "./compose";
import { parseCSV, toCSV } from "./csv";
import { classify } from "./classify";
import { seedProspects, SENDER } from "./data";
import { seedFor, senderFor } from "./data-intl";

describe("lint", () => {
  it("flags stock openers, em dashes and contrast reveals with positions", () => {
    const t = "Olá! Espero que esteja bem. Isso não é sobre preço, é sobre tempo — sério.";
    const issues = lint(t);
    const rules = issues.map((i) => i.rule);
    expect(rules).toContain("opener");
    expect(rules).toContain("dash");
    expect(rules).toContain("contrast");
    for (const i of issues) expect(t.slice(i.start, i.end).length).toBeGreaterThan(0);
  });
  it("scores clean text higher than robotic text", () => {
    const clean = "Vi que vocês abriram vaga para designer. Faço sites para clínicas e posso ajudar enquanto a vaga não fecha. Faz sentido conversar?";
    const robot = "Espero que esteja bem! Gostaria de alavancar sinergias. Pergunta rápida: o resultado? Incrível — de verdade.";
    expect(humanScore(clean)).toBeGreaterThan(humanScore(robot));
    expect(humanScore(clean)).toBeGreaterThanOrEqual(90);
  });
});

describe("compose", () => {
  it("builds a short lowercase subject, uses the signal and avoids AI tells", () => {
    const p = seedProspects[0];
    const e = compose(p, SENDER);
    expect(e.subject).toBe(e.subject.toLowerCase());
    expect(e.subject.split(" ").length).toBeLessThanOrEqual(4);
    expect(e.body).toContain(p.first);
    expect(e.body.toLowerCase()).toContain(p.signal.toLowerCase().slice(0, 12));
    expect(lint(e.body)).toEqual([]);
    expect(e.body).toMatch(/descadastrar|não quer receber/i);
  });
  it("creates a sequence with growing gaps and a breakup email, all clean", () => {
    const s = sequence(seedProspects[1], SENDER);
    expect(s.length).toBe(4);
    s.forEach((step, i) => { if (i) expect(step.day).toBeGreaterThan(s[i - 1].day); });
    expect(s.at(-1)!.angle).toBe("despedida");
    for (const step of s) expect(lint(step.body)).toEqual([]);
  });
});

describe("csv", () => {
  it("round-trips quoted fields", () => {
    const rows = parseCSV('nome,empresa\n"Ana, Jr","Estúdio ""Aurora"""\n');
    expect(rows).toEqual([{ nome: "Ana, Jr", empresa: 'Estúdio "Aurora"' }]);
  });
  it("neutralizes spreadsheet formula injection on export", () => {
    const out = toCSV([{ nome: "=HYPERLINK(\"x\")", nota: "+1", ok: "normal" }]);
    expect(out).toContain(`"'=HYPERLINK(""x"")"`);
    expect(out).toContain(`"'+1"`);
  });
});

describe("classify", () => {
  it.each([
    ["Pode ser, me manda horários na quinta?", "positivo"],
    ["Quanto custa mais ou menos?", "dúvida"],
    ["Agora não, talvez no ano que vem.", "depois"],
    ["Por favor me tire da lista.", "descadastro"],
    ["Estou fora do escritório até dia 20.", "ausente"],
    ["Fala com a Bia, ela cuida disso.", "indicação"],
    ["Já temos alguém fazendo isso.", "objeção"],
  ])("%s → %s", (text, type) => {
    expect(classify(text)).toBe(type);
  });
});

describe("other languages", () => {
  it.each(["en", "es"] as const)("%s drafts and sequences pass their own reviewer", (lang) => {
    const seeds = seedFor(lang);
    const e = compose(seeds[0], senderFor(lang), "direto", lang);
    expect(e.body).toContain(seeds[0].signal);
    expect(lint(e.body, lang)).toEqual([]);
    for (const step of sequence(seeds[1], senderFor(lang), lang)) expect(lint(step.body, lang)).toEqual([]);
  });
  it("catches robotic English and Spanish", () => {
    expect(humanScore("I hope this email finds you well! Quick question: we can leverage synergies — amazing.", "en")).toBeLessThan(60);
    expect(humanScore("¡Espero que estés bien! Pregunta rápida: podemos potenciar sinergias — increíble.", "es")).toBeLessThan(60);
  });
  it.each([
    ["en", "Please remove me from your list.", "descadastro"],
    ["en", "Sounds good, can you send me some times?", "positivo"],
    ["en", "I am out of the office until the 25th.", "ausente"],
    ["es", "Ahora no, quizás el año que viene.", "depois"],
    ["es", "Habla con Bea, ella lleva el marketing aquí.", "indicação"],
  ] as const)("classifies %s reply: %s", (lang, text, type) => {
    expect(classify(text, lang)).toBe(type);
  });
});
