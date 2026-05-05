// src/app/tickets/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PriorityBadge, StatusBadge, CategoryBadge } from '@/components/Badge';
import { Status, Priority, Category } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from '@/types';

interface SearchParams {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

export default async function TicketsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const where: Record<string, unknown> = {};
  if (user.role === 'USER') where.creatorId = user.id;
  if (searchParams.status) where.status = searchParams.status as Status;
  if (searchParams.priority) where.priority = searchParams.priority as Priority;
  if (searchParams.category) where.category = searchParams.category as Category;
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      creator: { select: { name: true, department: true } },
      assignee: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chamados</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tickets.length} chamado(s) encontrado(s)</p>
        </div>
        <Link
          href="/tickets/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Chamado
        </Link>
      </div>

      {/* Filters */}
      <form className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 flex flex-wrap gap-3 shadow-sm">
        <input
          name="search"
          defaultValue={searchParams.search}
          placeholder="Pesquisar chamados..."
          className="flex-1 min-w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          name="status"
          defaultValue={searchParams.status || ''}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue={searchParams.priority || ''}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todas as prioridades</option>
          {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={searchParams.category || ''}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todas as categorias</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Filtrar
        </button>
        <Link href="/tickets" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">
          Limpar
        </Link>
      </form>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium text-slate-700">Nenhum chamado encontrado</p>
            <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros ou abra um novo chamado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsável</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Criado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/tickets/${ticket.id}`} className="text-xs font-mono text-slate-400 hover:text-brand-600">
                      #{ticket.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/tickets/${ticket.id}`} className="group">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-brand-700 transition-colors">{ticket.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ticket.creator.name} · {ticket.creator.department}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <CategoryBadge category={ticket.category} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{ticket.assignee?.name || <span className="text-slate-300 italic">Não atribuído</span>}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                    {ticket._count.comments > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">💬 {ticket._count.comments}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
