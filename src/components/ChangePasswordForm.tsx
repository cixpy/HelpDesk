'use client';
// src/components/ChangePasswordForm.tsx
import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-slate-100'}`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
            {c.ok ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const PasswordInputField = memo(function PasswordInputField({
  label,
  field,
  value,
  placeholder,
  showPassword,
  onToggleShow,
  onChange,
  showStrength,
  passwordsMatch,
  passwordsMismatch,
}: {
  label: string;
  field: string;
  value: string;
  placeholder: string;
  showPassword: boolean;
  onToggleShow: () => void;
  onChange: (value: string) => void;
  showStrength?: boolean;
  passwordsMatch?: boolean;
  passwordsMismatch?: boolean;
}) {
  const inputClassName = field === 'confirmPassword'
    ? `w-full px-4 py-2.5 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${passwordsMismatch
      ? 'border-red-300 focus:ring-red-400'
      : passwordsMatch
        ? 'border-emerald-300 focus:ring-emerald-400'
        : 'border-slate-200 focus:ring-brand-500'
    }`
    : 'w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={inputClassName}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {showPassword ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {showStrength && <PasswordStrength password={value} />}
      {field === 'confirmPassword' && passwordsMatch && (
        <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          As senhas coincidem
        </p>
      )}
      {field === 'confirmPassword' && passwordsMismatch && (
        <p className="text-xs text-red-500 mt-1.5">As senhas não coincidem</p>
      )}
    </div>
  );
});

export default function ChangePasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleShow = useCallback(
    (field: keyof typeof showPasswords) =>
      setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] })),
    []
  );

  const handlePasswordChange = useCallback(
    (field: 'newPassword' | 'confirmPassword', value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    []
  );

  const passwordsMatch = !!(form.confirmPassword && form.newPassword === form.confirmPassword);
  const passwordsMismatch = !!(form.confirmPassword && form.newPassword !== form.confirmPassword);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('A nova senha e a confirmação não coincidem');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao trocar a senha');
        return;
      }

      router.push('/dashboard');
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
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <PasswordInputField
        label="Nova senha"
        field="newPassword"
        value={form.newPassword}
        placeholder="Mínimo 8 caracteres"
        showPassword={showPasswords.new}
        onToggleShow={() => toggleShow('new')}
        onChange={(value) => handlePasswordChange('newPassword', value)}
        showStrength
      />

      <PasswordInputField
        label="Confirmar nova senha"
        field="confirmPassword"
        value={form.confirmPassword}
        placeholder="Repita a nova senha"
        showPassword={showPasswords.confirm}
        onToggleShow={() => toggleShow('confirm')}
        onChange={(value) => handlePasswordChange('confirmPassword', value)}
        passwordsMatch={passwordsMatch}
        passwordsMismatch={passwordsMismatch}
      />

      <button
        type="submit"
        disabled={loading || !!passwordsMismatch}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm mt-2"
      >
        {loading ? 'Salvando...' : 'Definir nova senha e entrar'}
      </button>
    </form>
  );
}
