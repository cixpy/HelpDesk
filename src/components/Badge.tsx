// src/components/Badge.tsx
import clsx from 'clsx';
import { Priority, Status, Category } from '@prisma/client';
import { PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS } from '@/types';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

const priorityDot: Record<Priority, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-amber-400',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

const statusStyles: Record<Status, { bg: string; text: string; border: string }> = {
  OPEN: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  IN_PROGRESS: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  RESOLVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CLOSED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      `badge-priority-${priority}`,
      className
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', priorityDot[priority])} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status];
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
      style.bg,
      style.text,
      style.border,
      className
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200',
      className
    )}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}
