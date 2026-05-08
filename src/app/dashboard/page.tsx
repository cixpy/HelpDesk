// src/app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PriorityBadge, StatusBadge } from '@/components/Badge';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const where = user.role === 'USER' ? { creatorId: user.id } : {};

  const [total, open, inProgress, resolved, critical, recentTickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
    prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
    prisma.ticket.count({ where: { ...where, priority: 'CRITICAL' } }),
    prisma.ticket.findMany({
      where,
      include: {
        creator: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const stats = [
    { label: 'Total de Chamados', value: total, color: 'bg-slate-800', icon: '📋' },
    { label: 'Abertos', value: open, color: 'bg-blue-600', icon: '🔵' },
    { label: 'Em Andamento', value: inProgress, color: 'bg-violet-600', icon: '⚙️' },
    { label: 'Resolvidos', value: resolved, color: 'bg-emerald-600', icon: '✅' },
    { label: 'Críticos', value: critical, color: 'bg-red-600', icon: '🚨' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Olá, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Aqui está um resumo dos seus chamados de TI.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Chamados Recentes</h2>
          <Link href="/tickets" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Ver todos →
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500 font-medium">Nenhum chamado ainda</p>
            <p className="text-slate-400 text-sm mt-1">Abra seu primeiro chamado de suporte</p>
            <Link href="/tickets/new" className="inline-flex mt-4 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg font-medium hover:bg-brand-700 transition-colors">
              Novo Chamado
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentTickets.map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">#{ticket.id}</span>
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                      {ticket.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-400">{ticket.creator.name}</p>
                    {ticket.assignee && (
                      <p className="text-xs text-slate-400">→ {ticket.assignee.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
