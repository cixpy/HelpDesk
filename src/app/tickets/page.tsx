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
  page?: string;
  view?: string;
}

const PAGE_SIZE = 10;
const ACTIVE_STATUSES: Status[] = ['OPEN', 'IN_PROGRESS', 'WAITING_USER'];
const HISTORICAL_STATUSES: Status[] = ['RESOLVED', 'CLOSED'];

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-w-48 flex-1">
      {children}
      <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function buildTicketsHref(searchParams: SearchParams, page: number) {
  const params = new URLSearchParams();

  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.status) params.set('status', searchParams.status);
  if (searchParams.priority) params.set('priority', searchParams.priority);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.view) params.set('view', searchParams.view);
  if (page > 1) params.set('page', String(page));

  const query = params.toString();
  return query ? `/tickets?${query}` : '/tickets';
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

  const hasExplicitStatusFilter = Boolean(searchParams.status);
  const isHistoricalView = searchParams.view === 'historical';
  const currentPage = Math.max(1, Number(searchParams.page || '1') || 1);

  const listWhere = hasExplicitStatusFilter
    ? where
    : isHistoricalView
      ? { ...where, status: { in: HISTORICAL_STATUSES } }
      : { ...where, status: { in: ACTIVE_STATUSES } };

  const totalTickets = await prisma.ticket.count({ where: listWhere });
  const totalPages = Math.max(1, Math.ceil(totalTickets / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pageTitle = isHistoricalView ? 'Histórico' : 'Chamados';
  const pageSubtitle = isHistoricalView
    ? `${totalTickets} chamado(s) resolvido(s) e fechado(s)`
    : hasExplicitStatusFilter
      ? `${totalTickets} chamado(s) encontrado(s)`
      : `${totalTickets} chamado(s) em aberto`;

  const rawTickets = await prisma.ticket.findMany({
    where: listWhere,
    select: {
      id: true,
      title: true,
      category: true,
      priority: true,
      status: true,
      createdAt: true,
      creatorId: true,
      assigneeId: true,
      _count: { select: { comments: true } },
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  // Load related users separately to avoid runtime errors when DB has inconsistent relations
  const userIds = Array.from(new Set(rawTickets.flatMap((t) => [t.creatorId, t.assigneeId].filter(Boolean) as number[])));
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, department: true } })
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  const tickets = rawTickets.map(t => ({
    ...t,
    creator: userMap.get(t.creatorId) ?? { name: '—', department: null },
    assignee: t.assigneeId ? (userMap.get(t.assigneeId) ?? null) : null,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pageSubtitle}</p>
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

      <form className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 flex flex-wrap gap-3 shadow-sm">
        <input
          name="search"
          defaultValue={searchParams.search}
          placeholder="Pesquisar chamados..."
          className="min-w-48 flex-1 rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
        />
        <SelectShell>
          <select
            name="status"
            defaultValue={searchParams.status || ''}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition-colors focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </SelectShell>
        <SelectShell>
          <select
            name="priority"
            defaultValue={searchParams.priority || ''}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition-colors focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Todas as prioridades</option>
            {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </SelectShell>
        <SelectShell>
          <select
            name="category"
            defaultValue={searchParams.category || ''}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition-colors focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Todas as categorias</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </SelectShell>
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          Filtrar
        </button>
        <Link href="/tickets" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
          Limpar
        </Link>
      </form>

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

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildTicketsHref(searchParams, Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? 'px-3 py-2 rounded-lg text-sm font-medium border pointer-events-none border-slate-100 text-slate-300 bg-white' : 'px-3 py-2 rounded-lg text-sm font-medium border transition-colors border-slate-200 text-slate-700 hover:bg-white'}
              >
                Anterior
              </Link>
              <Link
                href={buildTicketsHref(searchParams, Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
                className={page === totalPages ? 'px-3 py-2 rounded-lg text-sm font-medium border pointer-events-none border-slate-100 text-slate-300 bg-white' : 'px-3 py-2 rounded-lg text-sm font-medium border transition-colors border-slate-200 text-slate-700 hover:bg-white'}
              >
                Próxima
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
