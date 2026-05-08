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

  await prisma.$executeRawUnsafe('TRUNCATE TABLE `Comment`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `StatusHistory`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `Ticket`');

  type TicketSeed = {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
    category: 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'ACCESS' | 'EMAIL' | 'PRINTER' | 'OTHER';
    assigneeId?: number;
    resolvedAt?: Date;
    comment?: string;
  };

  const ticketSeeds: TicketSeed[] = [
    {
      title: 'Computador não liga',
      description: 'Meu computador não está ligando desde esta manhã. Já tentei verificar os cabos mas não resolve.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'HARDWARE',
      assigneeId: tech.id,
      comment: 'Olá! Já registramos seu chamado. Vamos analisar o problema.',
    },
    {
      title: 'Sem acesso ao sistema de RH',
      description: 'Após atualização do sistema, perdi acesso ao portal de RH.',
      priority: 'MEDIUM',
      status: 'OPEN',
      category: 'ACCESS',
    },
    {
      title: 'Impressora não imprime',
      description: 'A impressora do setor financeiro parou de funcionar.',
      priority: 'LOW',
      status: 'RESOLVED',
      category: 'PRINTER',
      assigneeId: tech.id,
      resolvedAt: new Date(),
    },
    {
      title: 'E-mail corporativo não sincroniza',
      description: 'O Outlook parou de sincronizar novas mensagens desde ontem à noite.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'EMAIL',
      assigneeId: tech.id,
    },
    {
      title: 'Internet intermitente no setor fiscal',
      description: 'A conexão oscila várias vezes ao dia e derruba o acesso aos sistemas internos.',
      priority: 'CRITICAL',
      status: 'OPEN',
      category: 'NETWORK',
    },
    {
      title: 'Sistema ERP com erro ao abrir relatório',
      description: 'Ao gerar o relatório financeiro, o sistema mostra erro 500 e não conclui a consulta.',
      priority: 'HIGH',
      status: 'WAITING_USER',
      category: 'SOFTWARE',
      assigneeId: tech.id,
    },
    {
      title: 'Senha expirada no notebook',
      description: 'O usuário recebeu aviso de senha expirada e não consegue concluir a troca.',
      priority: 'MEDIUM',
      status: 'OPEN',
      category: 'ACCESS',
    },
    {
      title: 'Teclado sem algumas teclas',
      description: 'As teclas A, S e D deixaram de responder no teclado do recepcionista.',
      priority: 'LOW',
      status: 'IN_PROGRESS',
      category: 'HARDWARE',
      assigneeId: tech.id,
    },
    {
      title: 'Aplicativo interno fecha sozinho',
      description: 'O sistema de chamados fecha automaticamente depois de alguns segundos aberto.',
      priority: 'HIGH',
      status: 'OPEN',
      category: 'SOFTWARE',
    },
    {
      title: 'Telefone IP sem áudio',
      description: 'O telefone faz chamadas, mas o áudio do outro lado não funciona.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      category: 'NETWORK',
      assigneeId: tech.id,
    },
    {
      title: 'Scanner travando na digitalização',
      description: 'O scanner trava sempre que tentamos digitalizar documentos em lote.',
      priority: 'MEDIUM',
      status: 'OPEN',
      category: 'OTHER',
    },
    {
      title: 'Monitor sem imagem',
      description: 'O monitor liga, mas fica apenas com tela preta e sem sinal.',
      priority: 'HIGH',
      status: 'RESOLVED',
      category: 'HARDWARE',
      assigneeId: tech.id,
      resolvedAt: new Date(),
    },
    {
      title: 'Acesso bloqueado ao portal de benefícios',
      description: 'O colaborador não consegue acessar o portal após a troca de departamento.',
      priority: 'MEDIUM',
      status: 'WAITING_USER',
      category: 'ACCESS',
      assigneeId: tech.id,
    },
    {
      title: 'Wi-Fi lento na sala de reuniões',
      description: 'Durante as reuniões o sinal cai e os participantes perdem a conexão.',
      priority: 'LOW',
      status: 'OPEN',
      category: 'NETWORK',
    },
    {
      title: 'Erro ao salvar planilha no sistema',
      description: 'Ao anexar uma planilha o sistema informa que o formato não é compatível.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      category: 'SOFTWARE',
      assigneeId: tech.id,
    },
    {
      title: 'Impressora com papel atolado',
      description: 'A impressora da recepção está com papel atolado e não volta ao normal.',
      priority: 'LOW',
      status: 'OPEN',
      category: 'PRINTER',
    },
    {
      title: 'Computador muito lento após atualização',
      description: 'Depois da última atualização o computador demora vários minutos para abrir programas.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'HARDWARE',
      assigneeId: tech.id,
    },
    {
      title: 'E-mail enviado para destinatário errado',
      description: 'Foi enviado um e-mail importante para a lista errada e precisamos orientar a equipe.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      category: 'EMAIL',
      assigneeId: tech.id,
      resolvedAt: new Date(),
    },
    {
      title: 'Sem permissão para baixar relatório',
      description: 'O usuário recebe mensagem de acesso negado ao baixar o relatório mensal.',
      priority: 'MEDIUM',
      status: 'OPEN',
      category: 'ACCESS',
    },
    {
      title: 'Falha ao conectar na VPN',
      description: 'A VPN não autentica e interrompe o trabalho remoto da equipe.',
      priority: 'CRITICAL',
      status: 'WAITING_USER',
      category: 'NETWORK',
      assigneeId: tech.id,
    },
  ] as const;

  for (const ticketSeed of ticketSeeds) {
    const ticket = await prisma.ticket.create({
      data: {
        title: ticketSeed.title,
        description: ticketSeed.description,
        priority: ticketSeed.priority,
        status: ticketSeed.status,
        category: ticketSeed.category,
        creatorId: user.id,
        assigneeId: ticketSeed.assigneeId,
        resolvedAt: ticketSeed.resolvedAt,
      },
    });

    if (ticketSeed.comment) {
      await prisma.comment.create({
        data: {
          content: ticketSeed.comment,
          ticketId: ticket.id,
          userId: tech.id,
        },
      });
    }
  }

  console.log('✅ Seed concluído!');
  console.log('\nUsuários criados:');
  console.log('  Admin:    admin@devcix.com   / admin123  (sem troca de senha)');
  console.log('  Técnico:  tecnico@devcix.com / tech123   (troca obrigatória no 1º login)');
  console.log('  Usuário:  usuario@devcix.com / user123   (troca obrigatória no 1º login)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
