// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TI Helpdesk | Sistema de Chamados',
  description: 'Sistema de gerenciamento de chamados de TI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
