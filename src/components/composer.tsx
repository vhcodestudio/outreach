"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { lint, humanScore, type Issue } from "@/lib/lint";
import { compose, type Tone } from "@/lib/compose";
import { SENDER, type Prospect } from "@/lib/data";

function Mirror({ text, issues, active }: { text: string; issues: Issue[]; active: number }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  issues.forEach((i, n) => {
    if (i.start < last) return;
    parts.push(text.slice(last, i.start));
    parts.push(<mark key={n} className={n === active ? "on" : ""}>{text.slice(i.start, i.end)}</mark>);
    last = i.end;
  });
  parts.push(text.slice(last) + "\n");
  return <div aria-hidden="true" className="mirror pointer-events-none absolute inset-0 overflow-hidden text-transparent">{parts}</div>;
}

function Dial({ score }: { score: number }) {
  const r = 26, c = 2 * Math.PI * r;
  const color = score >= 85 ? "var(--color-ok)" : score >= 60 ? "var(--color-stamp)" : "var(--color-alert)";
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-rule)" strokeWidth="6" />
        <motion.circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c}
          initial={false} animate={{ strokeDashoffset: c * (1 - score / 100) }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
      </svg>
      <div>
        <p className="font-mono text-3xl leading-none tabular-nums" aria-live="polite">{score}</p>
        <p className="text-xs text-muted">soa humano</p>
      </div>
    </div>
  );
}

export function Composer({ prospects, onSend }: { prospects: Prospect[]; onSend: (p: Prospect, subject: string) => void }) {
  const candidates = prospects.filter((p) => p.stage === "novo" || p.stage === "contatado");
  const [pid, setPid] = useState(candidates[0]?.id ?? prospects[0].id);
  const [tone, setTone] = useState<Tone>("direto");
  const p = prospects.find((x) => x.id === pid)!;
  const [draft, setDraft] = useState(() => compose(p, SENDER, tone));
  const [active, setActive] = useState(-1);
  const [sent, setSent] = useState(false);
  const [flights, setFlights] = useState(0);
  const ta = useRef<HTMLTextAreaElement>(null);
  const mirror = useRef<HTMLDivElement>(null);

  const issues = useMemo(() => lint(draft.body), [draft.body]);
  const score = humanScore(draft.body);
  const words = draft.body.trim().split(/\s+/).length;

  function regenerate(nextP = p, nextTone = tone) { setDraft(compose(nextP, SENDER, nextTone)); setSent(false); setActive(-1); }
  function select(n: number) {
    setActive(n);
    const i = issues[n];
    ta.current?.focus();
    ta.current?.setSelectionRange(i.start, i.end);
  }
  function roboticize() {
    setDraft((d) => ({ ...d, body: `Olá ${p.first}! Espero que esteja bem.\n\nPergunta rápida: não é sobre ter um site, é sobre ter resultados — e nós podemos alavancar sua presença digital com soluções de ponta.\n\nPodemos agendar uma call de 30 minutos?` }));
    setSent(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-48 flex-1">
            <span className="text-xs font-medium text-muted">Para</span>
            <select value={pid} onChange={(e) => { setPid(e.target.value); regenerate(prospects.find((x) => x.id === e.target.value)!, tone); }}
              className="mt-1 w-full rounded-md border border-rule bg-sheet px-3 py-2.5">
              {prospects.map((x) => <option key={x.id} value={x.id}>{x.first} {x.last} · {x.company}</option>)}
            </select>
          </label>
          <fieldset className="flex rounded-md border border-rule bg-sheet p-1">
            <legend className="sr-only">Tom</legend>
            {(["direto", "caloroso", "curioso"] as Tone[]).map((t) => (
              <button key={t} onClick={() => { setTone(t); regenerate(p, t); }} aria-pressed={tone === t}
                className={`rounded px-3 py-1.5 text-sm capitalize ${tone === t ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>{t}</button>
            ))}
          </fieldset>
        </div>

        <div className="mt-4 rounded-lg border border-rule bg-sheet shadow-[0_1px_0_var(--color-rule),0_12px_30px_-18px_rgba(18,26,43,.35)]">
          <div className="airmail h-1.5 rounded-t-lg" aria-hidden="true" />
          <div className="grid grid-cols-[4.5rem_1fr] items-center border-b border-rule px-4 py-2.5 text-sm">
            <span className="text-muted">Para</span><span className="truncate font-mono text-[13px]">{p.email}</span>
          </div>
          <label className="grid grid-cols-[4.5rem_1fr] items-center border-b border-rule px-4 py-2.5 text-sm">
            <span className="text-muted">Assunto</span>
            <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="bg-transparent font-medium outline-none" />
          </label>
          <div className="relative">
            <div ref={mirror} className="contents"><Mirror text={draft.body} issues={issues} active={active} /></div>
            <textarea ref={ta} value={draft.body} aria-label="Corpo do e-mail" spellCheck
              onChange={(e) => { setDraft({ ...draft, body: e.target.value }); setSent(false); setActive(-1); }}
              style={{ fieldSizing: "content" } as React.CSSProperties} className="mirror-input relative block min-h-[22rem] w-full resize-none overflow-hidden bg-transparent text-[15px] outline-none" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3">
            <span className="font-mono text-xs text-muted">{words} palavras · {draft.subject.split(" ").length} no assunto</span>
            <div className="relative flex gap-2">
              <AnimatePresence>
                {sent && (
                  <motion.span key={flights} aria-hidden="true" className="pointer-events-none absolute -top-2 right-6 text-2xl"
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }} animate={{ x: 160, y: -220, rotate: -18, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>✉️</motion.span>
                )}
              </AnimatePresence>
              <button onClick={() => regenerate()} className="rounded-md border border-rule px-3 py-2 text-sm hover:border-ink">Gerar de novo</button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => { onSend(p, draft.subject); setSent(true); setFlights((f) => f + 1); }} disabled={sent}
                className="rounded-md bg-stamp px-4 py-2 text-sm font-semibold text-white disabled:bg-ok">
                {sent ? "Enviado (demo) ✓" : "Enviar (demo)"}
              </motion.button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">Modo demo: nada sai daqui. “Enviar” só registra o contato e move o prospect no funil.</p>
      </div>

      <aside className="space-y-5">
        <div className="rounded-lg border border-rule bg-sheet p-4">
          <div className="flex items-center justify-between">
            <Dial score={score} />
            <button onClick={roboticize} className="text-right text-xs text-muted underline hover:text-alert">ver um e-mail<br />robótico</button>
          </div>
          <h3 className="mt-4 text-sm font-semibold">Revisor de tom</h3>
          <AnimatePresence initial={false}>
            {issues.length === 0 ? (
              <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-ok">Nada soando como template. Pode mandar.</motion.p>
            ) : (
              <motion.ol key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-1.5">
                {issues.map((i, n) => (
                  <li key={`${i.start}-${i.rule}`}>
                    <button onClick={() => select(n)} className={`w-full rounded-md border px-3 py-2 text-left text-sm ${n === active ? "border-alert bg-alert/5" : "border-rule hover:border-ink"}`}>
                      <span className="font-mono text-xs text-alert">“{draft.body.slice(i.start, i.end).trim()}”</span>
                      <span className="mt-0.5 block text-muted">{i.message}</span>
                    </button>
                  </li>
                ))}
              </motion.ol>
            )}
          </AnimatePresence>
        </div>
        <div className="rounded-lg border border-dashed border-rule p-4 text-sm">
          <h3 className="font-semibold">Por que esse e-mail</h3>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li><b className="font-medium text-ink">Sinal:</b> {p.signal}</li>
            <li><b className="font-medium text-ink">Dor provável:</b> {p.problem}</li>
            <li>Assunto curto e em minúsculas, como e-mail de colega.</li>
            <li>Um pedido só, fácil de responder com uma linha.</li>
            <li>Linha de descadastro no fim.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
