// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin - mustChangePassword: false (already set up)
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@devcix.com' },
    update: {},
    create: {
      name: 'Administrador TI',
      email: 'admin@devcix.com',
      password: adminPassword,
      role: Role.ADMIN,
      department: 'TI',
      mustChangePassword: false,
    },
  });

  // Technician - mustChangePassword: true (will be forced to change on first login)
  const techPassword = await bcrypt.hash('tech123', 10);
  await prisma.user.upsert({
    where: { email: 'tecnico@devcix.com' },
    update: {},
    create: {
      name: 'João Técnico',
      email: 'tecnico@devcix.com',
      password: techPassword,
      role: Role.TECHNICIAN,
      department: 'TI',
      mustChangePassword: true,
    },
  });

  // Regular user - mustChangePassword: true
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'usuario@devcix.com' },
    update: {},
    create: {
      name: 'Maria Usuária',
      email: 'usuario@devcix.com',
      password: userPassword,
      role: Role.USER,
      department: 'Financeiro',
      mustChangePassword: true,
    },
  });

  // Sample tickets
  const admin = await prisma.user.findUnique({ where: { email: 'admin@devcix.com' } });
  const tech = await prisma.user.findUnique({ where: { email: 'tecnico@devcix.com' } });
  if (!admin || !tech) return;

  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Computador não liga',
      description: 'Meu computador não está ligando desde esta manhã. Já tentei verificar os cabos mas não resolve.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'HARDWARE',
      creatorId: user.id,
      assigneeId: tech.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Olá! Já registramos seu chamado. Vamos analisar o problema.',
      ticketId: ticket1.id,
      userId: tech.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: 'Sem acesso ao sistema de RH',
      description: 'Após atualização do sistema, perdi acesso ao portal de RH.',
      priority: 'MEDIUM',
      status: 'OPEN',
      category: 'ACCESS',
      creatorId: user.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: 'Impressora não imprime',
      description: 'A impressora do setor financeiro parou de funcionar.',
      priority: 'LOW',
      status: 'RESOLVED',
      category: 'PRINTER',
      creatorId: user.id,
      assigneeId: tech.id,
      resolvedAt: new Date(),
    },
  });

  console.log('✅ Seed concluído!');
  console.log('\nUsuários criados:');
  console.log('  Admin:    admin@devcix.com   / admin123  (sem troca de senha)');
  console.log('  Técnico:  tecnico@devcix.com / tech123   (troca obrigatória no 1º login)');
  console.log('  Usuário:  usuario@devcix.com / user123   (troca obrigatória no 1º login)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
