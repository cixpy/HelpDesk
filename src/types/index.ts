// src/types/index.ts
import { Priority, Status, Category, Role } from '@prisma/client';

export type { Priority, Status, Category, Role };

export interface TicketWithRelations {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  creator: {
    id: number;
    name: string;
    email: string;
    department: string | null;
  };
  assignee: {
    id: number;
    name: string;
    email: string;
  } | null;
  comments: CommentWithUser[];
  statusHistory: StatusHistoryWithUser[];
  _count?: {
    comments: number;
  };
}

export interface CommentWithUser {
  id: number;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    role: Role;
  };
}

export interface StatusHistoryWithUser {
  id: number;
  oldStatus: Status | null;
  newStatus: Status;
  note: string | null;
  createdAt: Date;
  user: {
    id: number;
    name: string;
  };
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Andamento',
  WAITING_USER: 'Aguardando Usuário',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  NETWORK: 'Rede',
  ACCESS: 'Acesso',
  EMAIL: 'E-mail',
  PRINTER: 'Impressora',
  OTHER: 'Outro',
};

export const ROLE_LABELS: Record<Role, string> = {
  USER: 'Usuário',
  TECHNICIAN: 'Técnico',
  ADMIN: 'Administrador',
};
