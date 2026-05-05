'use client';
// src/components/CommentSection.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

interface Comment {
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

interface CommentSectionProps {
  ticketId: number;
  comments: Comment[];
  currentUser: {
    id: number;
    name: string;
    role: string;
  };
}

const roleColors: Record<string, string> = {
  USER: 'bg-slate-600',
  TECHNICIAN: 'bg-brand-600',
  ADMIN: 'bg-red-600',
};

const roleLabels: Record<string, string> = {
  USER: 'Usuário',
  TECHNICIAN: 'Técnico',
  ADMIN: 'Admin',
};

export default function CommentSection({ ticketId, comments: initialComments, currentUser }: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const canBeInternal = currentUser.role !== 'USER';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), isInternal }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, newComment]);
        setContent('');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-semibold text-slate-800 mb-5 text-sm">
        Comentários {comments.length > 0 && <span className="text-slate-400 font-normal">({comments.length})</span>}
      </h3>

      <div className="space-y-4 mb-6">
        {comments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Nenhum comentário ainda. Seja o primeiro!</p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={clsx(
              'flex gap-3',
              comment.isInternal && 'opacity-90'
            )}
          >
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
              roleColors[comment.user.role]
            )}>
              {comment.user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className={clsx(
                'rounded-2xl rounded-tl-sm px-4 py-3',
                comment.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-700">{comment.user.name}</span>
                  <span className="text-xs text-slate-400">{roleLabels[comment.user.role]}</span>
                  {comment.isInternal && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Interno</span>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
              <p className="text-xs text-slate-400 mt-1 pl-1">
                {format(new Date(comment.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4">
        <div className="flex gap-3">
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
            roleColors[currentUser.role]
          )}>
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              {canBeInternal && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-3.5 h-3.5 accent-brand-600"
                  />
                  <span className="text-xs text-slate-500">Nota interna (não visível ao usuário)</span>
                </label>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
