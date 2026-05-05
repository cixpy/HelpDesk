// src/app/api/tickets/[id]/comments/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { content, isInternal } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Conteúdo do comentário é obrigatório' }, { status: 400 });
    }

    const ticketId = parseInt(params.id);
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });

    // Users can only comment on their own tickets
    if (user.role === 'USER' && ticket.creatorId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Only techs/admins can make internal comments
    const canBeInternal = user.role !== 'USER';

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        isInternal: canBeInternal ? (isInternal ?? false) : false,
        ticketId,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
