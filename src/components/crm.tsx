"use client";

import { useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from "motion/react";
import { STAGES, SENDER, type Prospect, type Stage } from "@/lib/data";
import { sequence } from "@/lib/compose";
import { classify, REPLY_LABEL, type ReplyType } from "@/lib/classify";
import { parseCSV, toCSV } from "@/lib/csv";
import { useCRM, today, brl } from "@/lib/store";
import { Composer } from "./composer";

const VIEWS = ["Funil", "Prospects", "Escrever", "Sequências", "Respostas"] as const;
type View = (typeof VIEWS)[number];

const SAMPLE_REPLIES = [
  "Pode ser, me manda horários na terça?",
  "Quanto custa mais ou menos uma página assim?",
  "Agora não, talvez no começo do ano.",
  "Fala com a Bia, ela cuida do marketing aqui.",
  "Estou fora do escritório até dia 25.",
  "Por favor me tire da lista.",
];
const AFTER_REPLY: Record<ReplyType, Stage> = {
  positivo: "respondeu", dúvida: "respondeu", indicação: "respondeu", objeção: "perdido", depois: "perdido", ausente: "contatado", descadastro: "perdido",
};
const TONE: Record<ReplyType, string> = {
  positivo: "bg-ok/10 text-ok", dúvida: "bg-stamp-soft text-stamp", indicação: "bg-stamp-soft text-stamp",
  objeção: "bg-alert/10 text-alert", depois: "bg-rule text-muted", ausente: "bg-rule text-muted", descadastro: "bg-alert/10 text-alert",
};

export function CRM() {
  const { state, setState, reset } = useCRM();
  const [view, setView] = useState<View>("Funil");
  const { prospects } = state;

  const move = (id: string, stage: Stage) =>
    setState((s) => ({ ...s, prospects: s.prospects.map((p) => (p.id === id ? { ...p, stage } : p)) }));

  function send(p: Prospect, subject: string) {
    setState((s) => ({
      ...s,
      prospects: s.prospects.map((x) => (x.id === p.id ? { ...x, stage: x.stage === "novo" ? "contatado" : x.stage, lastTouch: today() } : x)),
      sent: [...s.sent, { id: crypto.randomUUID(), prospectId: p.id, subject, at: today(), step: 0 }],
    }));
  }

  function simulateReply() {
    const pool = prospects.filter((p) => p.stage === "contatado");
    const target = pool[Math.floor(Math.random() * pool.length)];
    if (!target) return false;
    const text = SAMPLE_REPLIES[Math.floor(Math.random() * SAMPLE_REPLIES.length)];
    const type = classify(text);
    setState((s) => ({
      ...s,
      stopped: [...new Set([...s.stopped, target.id])],
      prospects: s.prospects.map((x) => (x.id === target.id ? { ...x, stage: AFTER_REPLY[type], replies: [...x.replies, { at: today(), text }] } : x)),
    }));
    return true;
  }

  const open = prospects.filter((p) => !["fechado", "perdido"].includes(p.stage));
  const replied = prospects.filter((p) => p.replies.length).length;
  const touched = prospects.filter((p) => p.stage !== "novo").length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex min-h-dvh max-w-[90rem] flex-col lg:flex-row">
        <aside className="border-b border-rule bg-sheet lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
            <p className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span className="grid size-7 place-items-center rounded-[3px] border-2 border-dashed border-stamp text-[11px] font-black text-stamp" aria-hidden="true">@</span>
              outreach
            </p>
            <span className="rounded-full bg-stamp-soft px-2 py-0.5 font-mono text-[11px] text-stamp lg:mt-2 lg:inline-block">modo demo</span>
          </div>
          <nav aria-label="Seções" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
            {VIEWS.map((v) => (
              <button key={v} onClick={() => setView(v)} aria-current={view === v ? "page" : undefined}
                className={`relative shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium ${view === v ? "text-ink" : "text-muted hover:text-ink"}`}>
                {view === v && <motion.span layoutId="nav" className="absolute inset-0 rounded-md bg-paper" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <span className="relative flex items-center justify-between gap-3">
                  {v}
                  {v === "Respostas" && replied > 0 && <span className="rounded-full bg-stamp px-1.5 font-mono text-[10px] text-white">{replied}</span>}
                </span>
              </button>
            ))}
          </nav>
          <div className="hidden px-5 pt-6 text-xs text-muted lg:block">
            <p className="font-mono uppercase tracking-wider">Em aberto</p>
            <p className="mt-1 font-mono text-2xl text-ink">{brl(open.reduce((a, p) => a + p.value, 0))}</p>
            <p className="mt-4 font-mono uppercase tracking-wider">Taxa de resposta</p>
            <p className="mt-1 font-mono text-2xl text-ink">{touched ? Math.round((replied / touched) * 100) : 0}%</p>
            <button onClick={reset} className="mt-8 underline">Restaurar dados de exemplo</button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{view === "Escrever" ? "Escrever e-mail" : view}</h2>
                  <p className="mt-1 text-muted">{SUB[view]}</p>
                </div>
              </header>
              {view === "Funil" && <Pipeline prospects={prospects} move={move} />}
              {view === "Prospects" && <Prospects prospects={prospects} setState={setState} />}
              {view === "Escrever" && <Composer prospects={prospects} onSend={send} />}
              {view === "Sequências" && <Sequences prospects={prospects} stopped={state.stopped} />}
              {view === "Respostas" && <Inbox prospects={prospects} onSimulate={simulateReply} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}

const SUB: Record<View, string> = {
  Funil: "Arraste os envelopes entre as etapas, ou use o menu de cada um.",
  Prospects: "Sua lista. Importe um CSV ou exporte o que já tem.",
  Escrever: "Um rascunho a partir do sinal que você anotou. O revisor marca o que soa robótico.",
  Sequências: "Follow-ups com um ângulo novo em cada toque. Param sozinhos quando a pessoa responde.",
  Respostas: "Cada resposta é classificada para você saber o que fazer primeiro.",
};

function Pipeline({ prospects, move }: { prospects: Prospect[]; move: (id: string, s: Stage) => void }) {
  const [over, setOver] = useState<Stage | null>(null);
  const dragId = useRef<string | null>(null);
  return (
    <LayoutGroup>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
        {STAGES.map((st) => {
          const items = prospects.filter((p) => p.stage === st.id);
          return (
            <section key={st.id} aria-label={st.label}
              onDragOver={(e) => { e.preventDefault(); setOver(st.id); }} onDragLeave={() => setOver(null)}
              onDrop={() => { if (dragId.current) move(dragId.current, st.id); dragId.current = null; setOver(null); }}
              className={`w-72 shrink-0 snap-start rounded-lg border p-2 transition-colors ${over === st.id ? "border-stamp bg-stamp-soft" : "border-rule bg-paper"}`}>
              <h2 className="flex items-center justify-between px-2 py-1.5 text-sm font-semibold">
                {st.label}
                <span className="font-mono text-xs text-muted">{items.length} · {brl(items.reduce((a, p) => a + p.value, 0))}</span>
              </h2>
              <ul className="mt-1 min-h-24 space-y-2">
                {items.map((p) => (
                  <motion.li key={p.id} layoutId={p.id} layout transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    draggable onDragStart={() => { dragId.current = p.id; }}
                    className="group relative cursor-grab overflow-hidden rounded-md border border-rule bg-sheet p-3 shadow-sm active:cursor-grabbing">
                    <div className="airmail absolute inset-x-0 top-0 h-1 opacity-70" aria-hidden="true" />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.company}</p>
                        <p className="truncate text-sm text-muted">{p.first} {p.last} · {p.role}</p>
                      </div>
                      <span className="shrink-0 rotate-3 rounded-[2px] border border-dashed border-stamp px-1.5 py-0.5 font-mono text-[10px] uppercase text-stamp">{p.segment}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm">{p.signal}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs">{brl(p.value)}</span>
                      <label className="text-xs">
                        <span className="sr-only">Mover {p.company} para</span>
                        <select value={p.stage} onChange={(e) => move(p.id, e.target.value as Stage)} className="rounded border border-rule bg-sheet px-1.5 py-1 text-xs">
                          {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </label>
                    </div>
                    {p.replies.length > 0 && <p className="mt-2 truncate border-t border-rule pt-2 text-xs text-muted">↩ “{p.replies.at(-1)!.text}”</p>}
                  </motion.li>
                ))}
                {!items.length && <li className="rounded-md border border-dashed border-rule p-4 text-center text-xs text-muted">Solte um envelope aqui</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

type SetState = ReturnType<typeof useCRM>["setState"];

function Prospects({ prospects, setState }: { prospects: Prospect[]; setState: SetState }) {
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState("todos");
  const [msg, setMsg] = useState("");
  const segments = ["todos", ...new Set(prospects.map((p) => p.segment))];
  const list = prospects.filter((p) => (seg === "todos" || p.segment === seg) && `${p.first} ${p.last} ${p.company} ${p.email}`.toLowerCase().includes(q.toLowerCase()));

  function exportCSV() {
    const csv = toCSV(prospects.map((p) => ({ nome: p.first, sobrenome: p.last, cargo: p.role, empresa: p.company, email: p.email, segmento: p.segment, sinal: p.signal, etapa: p.stage, valor: p.value })));
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: "prospects.csv" }).click();
    URL.revokeObjectURL(url);
  }

  async function importCSV(f?: File) {
    if (!f) return;
    if (f.size > 1_000_000) return setMsg("Arquivo grande demais (máx. 1 MB).");
    const rows = parseCSV(await f.text()).filter((r) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email ?? ""));
    const added: Prospect[] = rows.slice(0, 200).map((r) => ({
      id: crypto.randomUUID(), first: r.nome || r.first || "—", last: r.sobrenome || r.last || "", role: r.cargo || "", company: r.empresa || r.company || "—",
      email: r.email, segment: r.segmento || "Outro", signal: r.sinal || "", problem: r.dor || "o site atual não acompanha o momento da empresa", stage: "novo", value: Number(r.valor) || 0, replies: [],
    }));
    setState((s) => ({ ...s, prospects: [...s.prospects, ...added] }));
    setMsg(added.length ? `${added.length} prospects importados.` : "Nenhuma linha com e-mail válido. Colunas esperadas: nome, empresa, email, segmento, sinal.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nome, empresa, e-mail" aria-label="Buscar"
          className="min-w-56 flex-1 rounded-md border border-rule bg-sheet px-3 py-2.5" />
        <select value={seg} onChange={(e) => setSeg(e.target.value)} aria-label="Segmento" className="rounded-md border border-rule bg-sheet px-3 py-2.5">
          {segments.map((s) => <option key={s}>{s}</option>)}
        </select>
        <label className="cursor-pointer rounded-md border border-rule bg-sheet px-3 py-2.5 text-sm hover:border-ink">
          Importar CSV<input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => importCSV(e.target.files?.[0])} />
        </label>
        <button onClick={exportCSV} className="rounded-md bg-ink px-3 py-2.5 text-sm font-medium text-white">Exportar CSV</button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted">{msg}</p>
      <div className="mt-2 overflow-x-auto rounded-lg border border-rule bg-sheet">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-rule font-mono text-[11px] uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3 font-normal">Contato</th><th className="px-4 py-3 font-normal">Sinal</th><th className="px-4 py-3 font-normal">Etapa</th><th className="px-4 py-3 text-right font-normal">Valor</th><th className="px-4 py-3 font-normal">Último toque</th></tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-rule last:border-0 hover:bg-paper">
                <td className="px-4 py-3"><p className="font-medium">{p.first} {p.last}</p><p className="text-muted">{p.company} · <span className="font-mono text-xs">{p.email}</span></p></td>
                <td className="max-w-xs px-4 py-3 text-muted">{p.signal || "—"}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-paper px-2 py-1 text-xs">{STAGES.find((s) => s.id === p.stage)!.label}</span></td>
                <td className="px-4 py-3 text-right font-mono">{brl(p.value)}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{p.lastTouch ?? "—"}</td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">Ninguém com esse filtro.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Sequences({ prospects, stopped }: { prospects: Prospect[]; stopped: string[] }) {
  const active = prospects.filter((p) => p.stage !== "novo");
  const [pid, setPid] = useState(active[0]?.id);
  const p = prospects.find((x) => x.id === pid);
  const [openStep, setOpenStep] = useState(0);
  if (!p) return <p className="text-muted">Mande o primeiro e-mail para alguém e a sequência aparece aqui.</p>;
  const steps = sequence(p, SENDER);
  const isStopped = stopped.includes(p.id) || p.replies.length > 0;
  const start = p.lastTouch ? new Date(p.lastTouch + "T12:00") : new Date();
  const dateOf = (d: number) => new Date(start.getTime() + d * 864e5).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <ul className="space-y-1">
        {active.map((x) => (
          <li key={x.id}>
            <button onClick={() => { setPid(x.id); setOpenStep(0); }} aria-current={x.id === pid}
              className={`w-full rounded-md px-3 py-2 text-left text-sm ${x.id === pid ? "bg-sheet shadow-sm ring-1 ring-rule" : "text-muted hover:text-ink"}`}>
              <span className="block font-medium text-ink">{x.company}</span>
              <span className="text-xs">{x.replies.length ? "parada · respondeu" : "em andamento"}</span>
            </button>
          </li>
        ))}
      </ul>
      <div>
        {isStopped && (
          <p className="mb-4 rounded-md border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">
            {p.first} respondeu, então os próximos toques foram cancelados em todos os canais.
          </p>
        )}
        <ol className="relative border-l-2 border-rule pl-6">
          {steps.map((s, i) => {
            const done = i === 0 || (!isStopped && p.stage !== "contatado");
            const cancelled = isStopped && i > 0;
            return (
              <li key={s.day} className="relative pb-6 last:pb-0">
                <span className={`absolute -left-[33px] top-1 grid size-4 place-items-center rounded-full border-2 ${cancelled ? "border-rule bg-paper" : done ? "border-stamp bg-stamp" : "border-stamp bg-sheet"}`} />
                <button onClick={() => setOpenStep(i)} aria-expanded={openStep === i} className="flex w-full flex-wrap items-baseline gap-x-3 text-left">
                  <span className="font-mono text-xs text-muted">dia {s.day} · {dateOf(s.day)}</span>
                  <span className={`font-semibold ${cancelled ? "text-muted line-through" : ""}`}>{s.subject}</span>
                  <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">{s.angle}</span>
                </button>
                <AnimatePresence initial={false}>
                  {openStep === i && (
                    <motion.pre initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-3 whitespace-pre-wrap rounded-md border border-rule bg-sheet p-4 font-sans text-sm leading-relaxed">{s.body}</motion.pre>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Inbox({ prospects, onSimulate }: { prospects: Prospect[]; onSimulate: () => boolean }) {
  const [note, setNote] = useState("");
  const items = prospects.flatMap((p) => p.replies.map((r) => ({ p, r, type: classify(r.text) }))).sort((a, b) => b.r.at.localeCompare(a.r.at));
  const order: ReplyType[] = ["positivo", "dúvida", "indicação", "objeção", "depois", "ausente", "descadastro"];
  const counts = order.map((t) => [t, items.filter((i) => i.type === t).length] as const).filter(([, n]) => n);
  const NEXT: Record<ReplyType, string> = {
    positivo: "Responda em minutos com dois horários e um link de agenda.",
    dúvida: "Responda a pergunta em duas linhas e devolva com um pedido simples.",
    indicação: "Agradeça e escreva para a pessoa indicada citando quem indicou.",
    objeção: "Agradeça, deixe a porta aberta e encerre a sequência.",
    depois: "Anote para voltar na data que a pessoa sugeriu.",
    ausente: "Nada a fazer. O próximo toque sai depois da volta.",
    descadastro: "Remova da lista e confirme. Não escreva de novo.",
  };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {counts.map(([t, n]) => <span key={t} className={`rounded-full px-3 py-1 text-sm ${TONE[t]}`}>{REPLY_LABEL[t]} · {n}</span>)}
        <button onClick={() => setNote(onSimulate() ? "Nova resposta chegou." : "Ninguém em “Contatados” para responder. Mande um e-mail antes.")}
          className="ml-auto rounded-md border border-ink px-3 py-2 text-sm font-medium hover:bg-ink hover:text-white">Simular resposta</button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted">{note}</p>
      <ul className="mt-2 divide-y divide-rule rounded-lg border border-rule bg-sheet">
        <AnimatePresence initial={false}>
          {items.map(({ p, r, type }) => (
            <motion.li key={p.id + r.at + r.text} layout initial={{ opacity: 0, backgroundColor: "#e6e9ff" }} animate={{ opacity: 1, backgroundColor: "#ffffff" }} transition={{ duration: 0.8 }}
              className="grid gap-2 p-4 sm:grid-cols-[12rem_1fr_auto] sm:items-start sm:gap-4">
              <div><p className="font-semibold">{p.first} {p.last}</p><p className="text-sm text-muted">{p.company}</p></div>
              <div><p>“{r.text}”</p><p className="mt-1 text-sm text-muted">→ {NEXT[type]}</p></div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TONE[type]}`}>{REPLY_LABEL[type]}</span>
                <span className="font-mono text-xs text-muted">{r.at}</span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {!items.length && <li className="p-10 text-center text-muted">Nenhuma resposta ainda.</li>}
      </ul>
    </div>
  );
}
