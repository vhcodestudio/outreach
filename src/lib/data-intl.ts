import { seedProspects, SENDER, type Prospect, type Sender } from "./data";

type Lang = "pt" | "en" | "es";
type Text = Pick<Prospect, "role" | "segment" | "signal" | "problem" | "topic"> & { replies?: string[] };

/** English and Spanish copy for the sample prospects (same ids, people and stages as Portuguese). */
const TEXT: Record<Exclude<Lang, "pt">, Record<string, Text>> = {
  en: {
    "1": { topic: "online booking", role: "Partner", segment: "Health", signal: "opened a second clinic in Pinheiros", problem: "the site still shows only the old address and has no online booking" },
    "2": { topic: "orders via dm", role: "Founder", segment: "Food", signal: "launched a coffee subscription on Instagram", problem: "orders arrive by DM and get lost in the middle of the messages" },
    "3": { topic: "2027 enrollment", role: "Principal", segment: "Education", signal: "opened enrollment for 2027", problem: "the interest form is a PDF you have to print", replies: ["Hi Rafa, sounds good. Can you send me some times on Thursday?"] },
    "4": { topic: "launch pages", role: "Manager", segment: "Real estate", signal: "announced 40 new listings last quarter", problem: "every new listing means asking an agency to publish the page" },
    "5": { topic: "mobile site", role: "Owner", segment: "Fashion", signal: "had the studio featured in Casa Vogue", problem: "people arriving from the article land on a site that does not load on mobile" },
    "6": { topic: "google leads", role: "CEO", segment: "Services", signal: "hired two junior accountants", problem: "new work comes from referrals and the site does not convert people searching on Google", replies: ["We already have someone doing that, thanks."] },
    "7": { topic: "saturday hours", role: "Physical therapist", segment: "Health", signal: "started seeing patients on Saturdays", problem: "the new hours do not show up on Google or on the site" },
    "8": { topic: "delivery menu", role: "Partner", segment: "Food", signal: "launched their own delivery to avoid app fees", problem: "the online menu is a photo of the printed one", replies: ["Not now, maybe next year."] },
  },
  es: {
    "1": { topic: "reservas online", role: "Socia", segment: "Salud", signal: "abrieron una segunda clínica en Pinheiros", problem: "el sitio todavía muestra solo la dirección antigua y no tiene reservas online" },
    "2": { topic: "pedidos por dm", role: "Fundador", segment: "Comida", signal: "lanzaron una suscripción de café por Instagram", problem: "los pedidos llegan por DM y se pierden entre los mensajes" },
    "3": { topic: "matrículas 2027", role: "Directora", segment: "Educación", signal: "abrieron las matrículas para 2027", problem: "el formulario de interés es un PDF para imprimir", replies: ["Hola Rafa, puede ser. ¿Me mandas unos horarios el jueves?"] },
    "4": { topic: "páginas de lanzamientos", role: "Gerente", segment: "Inmobiliario", signal: "anunciaron 40 lanzamientos el último trimestre", problem: "cada inmueble nuevo obliga a pedirle a una agencia que suba la página" },
    "5": { topic: "sitio en el celular", role: "Propietaria", segment: "Moda", signal: "el taller salió en una nota de Casa Vogue", problem: "quien llega desde la nota cae en un sitio que no carga en el celular" },
    "6": { topic: "clientes de google", role: "CEO", segment: "Servicios", signal: "contrataron a dos contadores junior", problem: "la demanda llega por recomendación y el sitio no convierte a quien busca en Google", replies: ["Ya tenemos a alguien haciendo eso, gracias."] },
    "7": { topic: "horario de sábado", role: "Fisioterapeuta", segment: "Salud", signal: "empezaron a atender los sábados", problem: "el horario nuevo no aparece en Google ni en el sitio" },
    "8": { topic: "menú del delivery", role: "Socio", segment: "Comida", signal: "abrieron delivery propio para escapar de las comisiones de la app", problem: "el menú online es una foto del menú impreso", replies: ["Ahora no, quizás el año que viene."] },
  },
};

const SENDERS: Record<Exclude<Lang, "pt">, Sender> = {
  en: { name: "Rafa", offer: "fast websites for small businesses", proof: "the Lume Clinic page started getting 3x more bookings through the site in two months", signature: "Rafa Moreira · independent web studio" },
  es: { name: "Rafa", offer: "sitios rápidos para pequeños negocios", proof: "la página de la Clínica Lume empezó a recibir 3 veces más reservas por el sitio en dos meses", signature: "Rafa Moreira · estudio independiente de web" },
};

export function seedFor(lang: Lang): Prospect[] {
  if (lang === "pt") return seedProspects;
  return seedProspects.map((p) => {
    const t = TEXT[lang][p.id];
    return { ...p, ...t, replies: p.replies.map((r, i) => ({ ...r, text: t.replies?.[i] ?? r.text })) };
  });
}

export const senderFor = (lang: Lang): Sender => (lang === "pt" ? SENDER : SENDERS[lang]);
