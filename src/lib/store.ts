"use client";

import { useEffect, useState } from "react";
import type { Prospect } from "./data";
import { seedFor } from "./data-intl";

type Lang = "pt" | "en" | "es";
export type Sent = { id: string; prospectId: string; subject: string; at: string; step: number };
type State = { prospects: Prospect[]; sent: Sent[]; stopped: string[] };

const keyFor = (lang: Lang) => (lang === "pt" ? "outreach:v2" : `outreach:v2:${lang}`);
const initialFor = (lang: Lang): State => ({ prospects: seedFor(lang), sent: [], stopped: [] });

/** Each language keeps its own demo data, so switching never mixes languages in one list. */
export function useCRM(lang: Lang = "pt") {
  const [state, setState] = useState<State>(() => initialFor(lang));
  const [loaded, setLoaded] = useState<Lang | null>(null);

  useEffect(() => {
    let next = initialFor(lang);
    try {
      const raw = localStorage.getItem(keyFor(lang));
      if (raw) next = JSON.parse(raw) as State;
    } catch { /* storage blocked: keep the sample data */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount (SSR-safe)
    setState(next);
    setLoaded(lang);
  }, [lang]);

  useEffect(() => {
    if (loaded !== lang) return;
    try { localStorage.setItem(keyFor(lang), JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, loaded, lang]);

  const reset = () => setState(initialFor(lang));
  return { state, setState, reset };
}

export const today = () => new Date().toISOString().slice(0, 10);

/** Sample values are stored in reais; English and Spanish show them as rough US dollars. */
export function money(n: number, locale = "pt-BR", currency = "BRL") {
  const v = currency === "BRL" ? n : Math.round(n / 5.5 / 50) * 50;
  return v.toLocaleString(locale, { style: "currency", currency, maximumFractionDigits: 0 });
}
export const brl = (n: number) => money(n);
