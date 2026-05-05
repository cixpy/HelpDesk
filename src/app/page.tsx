// src/app/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">TI Helpdesk</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de Chamados de Suporte</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Entrar na sua conta</h2>
          <p className="text-slate-500 text-sm mb-6">Acesse com suas credenciais corporativas</p>
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          © {currentYear} TI Helpdesk. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
