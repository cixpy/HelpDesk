// src/app/api/users/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 'USER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const technicians = await prisma.user.findMany({
      where: { role: { in: ['TECHNICIAN', 'ADMIN'] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(technicians);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem criar usuários' }, { status: 403 });
    }

    const { name, email, role, department, phone } = await req.json();

    if (!name?.trim() || !email?.trim() || !role) {
      return NextResponse.json({ error: 'Nome, e-mail e perfil são obrigatórios' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
    }

    // Temporary password — user must change on first login
    const tempPassword = await hashPassword('Mudar@123');

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: tempPassword,
        role: role as Role,
        department: department?.trim() || null,
        phone: phone?.trim() || null,
        mustChangePassword: true,
      },
      select: { id: true, name: true, email: true, role: true, department: true, mustChangePassword: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
