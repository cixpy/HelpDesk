'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface RefreshButtonProps {
    showInterval?: boolean;
}

export default function RefreshButton({ showInterval = true }: RefreshButtonProps) {
    const router = useRouter();
    const [isAutoRefresh, setIsAutoRefresh] = useState(false);
    const [interval, setInterval] = useState(30); // segundos
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setLastRefresh(new Date());

        // Trigger router refresh to reload server data
        router.refresh();

        setTimeout(() => setIsRefreshing(false), 500);
    }, [router]);

    useEffect(() => {
        if (!isAutoRefresh) return;

        const timer = window.setInterval(() => {
            handleRefresh();
        }, interval * 1000);

        return () => window.clearInterval(timer);
    }, [isAutoRefresh, interval, handleRefresh]);

    const formatLastRefresh = (date: Date | null) => {
        if (!date) return 'nunca';
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffSeconds < 60) return `${diffSeconds}s atrás`;
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m atrás`;
        return `${Math.floor(diffSeconds / 3600)}h atrás`;
    };

    return (
        <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                title="Recarregar dados"
                aria-label="Recarregar"
            >
                <svg
                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
            </button>

            {/* Auto Refresh Toggle */}
            <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isAutoRefresh
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                title={isAutoRefresh ? `Auto-refresh a cada ${interval}s` : 'Ativar auto-refresh'}
            >
                <span className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-brand-600' : 'bg-slate-300'}`} />
                Auto
            </button>

            {/* Interval Selector */}
            {showInterval && isAutoRefresh && (
                <select
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="px-2 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                </select>
            )}

            {/* Last Refresh Time */}
            <div className="text-xs text-slate-400 px-2">
                Último: {formatLastRefresh(lastRefresh)}
            </div>
        </div>
    );
}
