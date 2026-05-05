// src/app/api/tickets/[id]/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Status } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        creator: { select: { id: true, name: true, email: true, department: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        statusHistory: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });

    // Regular users can only see their tickets
    if (user.role === 'USER' && ticket.creatorId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const ticketId = parseInt(params.id);

    const currentTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!currentTicket) return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });

    // Only techs and admins can update status/assignee
    if (user.role === 'USER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId;
    if (body.priority) updateData.priority = body.priority;
    if (body.status === 'RESOLVED' || body.status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, email: true, department: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    // Track status change
    if (body.status && body.status !== currentTicket.status) {
      await prisma.statusHistory.create({
        data: {
          oldStatus: currentTicket.status,
          newStatus: body.status as Status,
          note: body.note,
          ticketId,
          userId: user.id,
        },
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
