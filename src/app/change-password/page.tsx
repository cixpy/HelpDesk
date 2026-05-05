// src/app/change-password/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ChangePasswordForm from '@/components/ChangePasswordForm';

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();

  if (!user) redirect('/');
  // If they already have a good password, send them home
  if (!user.mustChangePassword) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Troca de Senha Obrigatória</h1>
          <p className="text-slate-400 text-sm mt-1">Você precisa definir uma senha pessoal antes de continuar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Senha temporária detectada</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Olá, <strong>{user.name}</strong>! Por segurança, defina uma senha pessoal para continuar usando o sistema.
              </p>
            </div>
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
