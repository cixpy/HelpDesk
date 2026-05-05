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
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      `badge-status-${status}`,
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
