// src/app/tickets/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PriorityBadge, StatusBadge, CategoryBadge } from '@/components/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TicketActions from '@/components/TicketActions';
import CommentSection from '@/components/CommentSection';
import Link from 'next/link';

export default async function TicketPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const ticketId = parseInt(params.id);
  if (isNaN(ticketId)) notFound();

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: { select: { id: true, name: true, email: true, department: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
        where: user.role === 'USER' ? { isInternal: false } : {},
      },
      statusHistory: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) notFound();
  if (user.role === 'USER' && ticket.creatorId !== user.id) notFound();

  const canManage = user.role === 'TECHNICIAN' || user.role === 'ADMIN';
  const resolvedStatuses = new Set(['RESOLVED', 'CLOSED']);
  const regularHistory = ticket.statusHistory.filter((history) => !resolvedStatuses.has(history.newStatus));
  const resolvedHistory = ticket.statusHistory.filter((history) => resolvedStatuses.has(history.newStatus));

  let technicians: { id: number; name: string; email: string }[] = [];
  if (canManage) {
    technicians = await prisma.user.findMany({
      where: { role: { in: ['TECHNICIAN', 'ADMIN'] } },
      select: { id: true, name: true, email: true },
    });
  }

  return (
    <div className="p-4 md:p-8">
      {/* Back */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/tickets" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <span className="text-slate-400 text-sm">Chamados</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 text-sm font-mono">#{ticket.id}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          {/* Ticket info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
              <div className="flex-1">
                <h1 className="text-lg md:text-xl font-bold text-slate-900">{ticket.title}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <CategoryBadge category={ticket.category} />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Status history */}
          {regularHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm">Histórico convencional</h3>
              <div className="space-y-3">
                {regularHistory.map((history) => (
                  <div key={history.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{history.user.name}</span>
                        {history.oldStatus
                          ? ` alterou o status de "${history.oldStatus}" para "${history.newStatus}"`
                          : ` abriu o chamado`}
                        {history.note && <span className="text-slate-500"> — {history.note}</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(history.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedHistory.length > 0 && (
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-100 shadow-sm p-4 md:p-6">
              <h3 className="font-semibold text-emerald-900 mb-4 text-sm">Resolvidos</h3>
              <div className="space-y-3">
                {resolvedHistory.map((history) => (
                  <div key={history.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{history.user.name}</span>
                        {history.oldStatus
                          ? ` encerrou o chamado de "${history.oldStatus}" para "${history.newStatus}"`
                          : ` abriu o chamado`}
                        {history.note && <span className="text-slate-500"> — {history.note}</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(history.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentSection
            ticketId={ticket.id}
            comments={ticket.comments as Parameters<typeof CommentSection>[0]['comments']}
            currentUser={user}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm">Detalhes</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">Solicitante</dt>
                <dd className="text-sm text-slate-800 mt-1">{ticket.creator.name}</dd>
                <dd className="text-xs text-slate-400">{ticket.creator.department}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">Responsável</dt>
                <dd className="text-sm text-slate-800 mt-1">{ticket.assignee?.name || <span className="text-slate-400 italic">Não atribuído</span>}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">Aberto em</dt>
                <dd className="text-sm text-slate-800 mt-1">
                  {format(new Date(ticket.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </dd>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">Resolvido em</dt>
                  <dd className="text-sm text-slate-800 mt-1">
                    {format(new Date(ticket.resolvedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions for techs */}
          {canManage && (
            <TicketActions
              ticket={{
                id: ticket.id,
                status: ticket.status,
                priority: ticket.priority,
                assigneeId: ticket.assigneeId,
              }}
              technicians={technicians}
            />
          )}
        </div>
      </div>
    </div>
  );
}
