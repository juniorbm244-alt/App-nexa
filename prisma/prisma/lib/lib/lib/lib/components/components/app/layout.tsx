import "./globals.css";
import { Providers } from "./providers";

export const metadata = { title: "NEXA — Gestão patrimonial", description: "Tudo o que importa para o seu patrimônio. Em um só lugar." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
