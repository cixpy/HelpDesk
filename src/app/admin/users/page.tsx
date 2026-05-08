// src/app/admin/users/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import UsersClient from '@/components/UsersClient';

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'ADMIN') redirect('/dashboard');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      phone: true,
      mustChangePassword: true,
      createdAt: true,
      _count: { select: { ticketsCreated: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Usuários</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} usuário(s) cadastrado(s)</p>
        </div>
      </div>

      {/* Users table + create form */}
      <UsersClient users={users} currentUserId={currentUser.id} />
    </div>
  );
}
