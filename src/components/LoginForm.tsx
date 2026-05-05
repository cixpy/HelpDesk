'use client';
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login');
        return;
      }

      // Redirect to change-password if required, otherwise dashboard
      if (data.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          E-mail corporativo
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@devcix.com"
          required
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm mt-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Entrando...
          </span>
        ) : 'Entrar'}
      </button>

      <div className="border-t border-slate-100 pt-4 mt-4">
        <p className="text-xs text-slate-400 text-center">Credenciais de teste:</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-50 rounded p-2 text-center">
            <p className="font-medium text-slate-600">Admin</p>
            <p className="text-slate-400 truncate">admin@devcix.com</p>
            <p className="text-slate-400">admin123</p>
          </div>
          <div className="bg-slate-50 rounded p-2 text-center">
            <p className="font-medium text-slate-600">Técnico</p>
            <p className="text-slate-400 truncate">tecnico@...</p>
            <p className="text-slate-400">tech123</p>
          </div>
          <div className="bg-slate-50 rounded p-2 text-center">
            <p className="font-medium text-slate-600">Usuário</p>
            <p className="text-slate-400 truncate">usuario@...</p>
            <p className="text-slate-400">user123</p>
          </div>
        </div>
      </div>
    </form>
  );
}
