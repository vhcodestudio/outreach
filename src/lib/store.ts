"use client";

import { useEffect, useState } from "react";
import { seedProspects, type Prospect } from "./data";

const KEY = "outreach:v2";
export type Sent = { id: string; prospectId: string; subject: string; at: string; step: number };
type State = { prospects: Prospect[]; sent: Sent[]; stopped: string[] };

const initial: State = { prospects: seedProspects, sent: [], stopped: [] };

export function useCRM() {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount (SSR-safe)
      if (raw) setState(JSON.parse(raw) as State);
    } catch { /* storage bloqueado: segue com os dados de exemplo */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, ready]);

  const reset = () => setState(initial);
  return { state, setState, reset };
}

export const today = () => new Date().toISOString().slice(0, 10);
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
