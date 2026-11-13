export type Stage = "novo" | "contatado" | "respondeu" | "reuniao" | "fechado" | "perdido";
export type Prospect = {
  id: string;
  first: string;
  last: string;
  role: string;
  company: string;
  email: string;
  segment: string;
  signal: string; // what we noticed
  topic?: string; // 2-3 word subject line
  problem: string; // what that usually means
  stage: Stage;
  value: number; // R$
  lastTouch?: string; // yyyy-mm-dd
  replies: { at: string; text: string }[];
};

export type Sender = { name: string; offer: string; proof: string; signature: string };

export const STAGES: { id: Stage; label: string }[] = [
  { id: "novo", label: "Novos" },
  { id: "contatado", label: "Contatados" },
  { id: "respondeu", label: "Responderam" },
  { id: "reuniao", label: "Reunião" },
  { id: "fechado", label: "Fechados" },
  { id: "perdido", label: "Perdidos" },
];

export const SENDER: Sender = {
  name: "Rafa",
  offer: "sites rápidos para pequenos negócios",
  proof: "a página da Clínica Lume passou a receber 3x mais agendamentos pelo site em dois meses",
  signature: "Rafa Moreira · estúdio independente de web",
};

const p = (o: Omit<Prospect, "replies"> & { replies?: Prospect["replies"] }): Prospect => ({ replies: [], ...o });

export const seedProspects: Prospect[] = [
  p({ id: "1", topic: "agendamento online", first: "Marina", last: "Couto", role: "Sócia", company: "Couto Odontologia", email: "marina@couto.example", segment: "Saúde",
    signal: "abriram uma segunda unidade em Pinheiros", problem: "o site ainda mostra só o endereço antigo e não tem agendamento online", stage: "novo", value: 6800 }),
  p({ id: "2", topic: "pedidos por dm", first: "Diego", last: "Arantes", role: "Fundador", company: "Torra Café", email: "diego@torra.example", segment: "Food",
    signal: "lançaram assinatura de café pelo Instagram", problem: "os pedidos chegam por DM e somem no meio das mensagens", stage: "contatado", value: 4500, lastTouch: "2026-11-09" }),
  p({ id: "3", topic: "matrículas 2027", first: "Lúcia", last: "Ferraz", role: "Diretora", company: "Escola Ipê", email: "lucia@ipe.example", segment: "Educação",
    signal: "estão com matrículas abertas para 2027", problem: "o formulário de interesse é um PDF para imprimir", stage: "respondeu", value: 9200, lastTouch: "2026-11-06",
    replies: [{ at: "2026-11-11", text: "Oi Rafa, pode ser. Me manda uns horários na quinta?" }] }),
  p({ id: "4", topic: "páginas dos lançamentos", first: "Caio", last: "Bastos", role: "Gerente", company: "Bastos Imóveis", email: "caio@bastos.example", segment: "Imobiliário",
    signal: "anunciaram 40 lançamentos no último trimestre", problem: "cada imóvel novo exige pedir ajuda a uma agência para subir a página", stage: "reuniao", value: 14000, lastTouch: "2026-11-04" }),
  p({ id: "5", topic: "site no celular", first: "Bea", last: "Lins", role: "Proprietária", company: "Ateliê Lins", email: "bea@lins.example", segment: "Moda",
    signal: "o ateliê saiu numa matéria da Casa Vogue", problem: "quem chega pela matéria cai num site que não carrega no celular", stage: "fechado", value: 5200, lastTouch: "2026-10-28" }),
  p({ id: "6", topic: "clientes do google", first: "Otávio", last: "Reis", role: "CEO", company: "Reis Contabilidade", email: "otavio@reis.example", segment: "Serviços",
    signal: "contrataram dois contadores júnior", problem: "a demanda está vindo por indicação e o site não converte quem pesquisa no Google", stage: "contatado", value: 7600, lastTouch: "2026-11-02",
    replies: [{ at: "2026-11-05", text: "Já temos alguém fazendo isso, obrigado." }] }),
  p({ id: "7", topic: "horário de sábado", first: "Helena", last: "Prado", role: "Fisioterapeuta", company: "Movimento Fisio", email: "helena@movimento.example", segment: "Saúde",
    signal: "começaram a atender aos sábados", problem: "o horário novo não aparece no Google nem no site", stage: "novo", value: 3900 }),
  p({ id: "8", topic: "cardápio do delivery", first: "Rui", last: "Tavares", role: "Sócio", company: "Brasa Burger", email: "rui@brasa.example", segment: "Food",
    signal: "abriram delivery próprio para fugir das taxas do app", problem: "o cardápio online é uma foto do menu impresso", stage: "perdido", value: 4100, lastTouch: "2026-10-20",
    replies: [{ at: "2026-10-22", text: "Agora não, talvez ano que vem." }] }),
];
