import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = "outreach — CRM de prospecção para freelancers";
const description = "Listas de prospects, cold e-mails personalizados com revisor de tom, sequências de follow-up e funil de respostas. Modo demo.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://outreach-vhcode.vercel.app"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  referrer: "strict-origin-when-cross-origin",
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = { themeColor: "#f6f6f3" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable} antialiased`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebApplication", name: "outreach", url: "https://outreach-vhcode.vercel.app",
          applicationCategory: "BusinessApplication", description, author: { "@type": "Organization", name: "vhcodestudio" },
        }) }} />
      </body>
    </html>
  );
}
