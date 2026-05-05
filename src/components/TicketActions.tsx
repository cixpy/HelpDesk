'use client';
// src/components/TicketActions.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Status, Priority } from '@prisma/client';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';

interface TicketActionsProps {
  ticket: {
    id: number;
    status: Status;
    priority: Priority;
    assigneeId: number | null;
  };
  technicians: { id: number; name: string; email: string }[];
}

export default function TicketActions({ ticket, technicians }: TicketActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assigneeId, setAssigneeId] = useState<string>(ticket.assigneeId?.toString() || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleUpdate() {
    setLoading(true);
    setSuccess('');

    try {
      const body: Record<string, unknown> = { priority, assigneeId: assigneeId ? parseInt(assigneeId) : null };
      if (status !== ticket.status) {
        body.status = status;
        body.note = note;
      }

      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess('Chamado atualizado!');
        setNote('');
        router.refresh();
        setTimeout(() => setSuccess(''), 3000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-semibold text-slate-800 mb-4 text-sm">Ações do Técnico</h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-1.5">Prioridade</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-1.5">Atribuir a</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Não atribuído</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>{tech.name}</option>
            ))}
          </select>
        </div>

        {status !== ticket.status && (
          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-1.5">Nota de mudança</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explique o motivo da mudança..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        )}

        {success && (
          <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">✓ {success}</p>
        )}

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
