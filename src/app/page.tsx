import { CRM } from "@/components/crm";

export default function Home() {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white">Pular para o conteúdo</a>
      <h1 className="sr-only">outreach, CRM de prospecção para freelancers</h1>
      <div id="app"><CRM /></div>
    </>
  );
}
