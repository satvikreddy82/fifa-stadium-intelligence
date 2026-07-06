'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Users, TrendingUp, AlertTriangle, RefreshCw, Brain, ArrowRight, Zap } from 'lucide-react';
import { useCrowdStore } from '@/store/use-crowd-store';
import { useAppStore } from '@/store/use-app-store';
import { generateHeatmapData, type HeatmapCell } from '@/lib/crowd-simulation';
import { cn, getCongestionColor, formatNumber, formatPercent } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// ─── Heatmap Grid ─────────────────────────────────────────
function HeatmapGrid({ data }: { data: HeatmapCell[] }) {
  const gridSize = 12;
  const cells = data.filter(c => c.density > 0);

  return (
    <div
      role="img"
      aria-label="Stadium crowd heatmap"
      className="relative w-full aspect-square max-w-md mx-auto"
    >
      <svg viewBox="0 0 240 240" className="w-full h-full">
        {/* Background */}
        <rect width="240" height="240" fill="#0a0f1a" rx="12" />

        {/* Heat cells */}
        {data.map(cell => {
          if (cell.density === 0) return null;
          const color = getCongestionColor(cell.density);
          return (
            <rect
              key={`${cell.x}-${cell.y}`}
              x={cell.x * 20}
              y={cell.y * 20}
              width="19"
              height="19"
              rx="2"
              fill={color}
              opacity={0.3 + cell.density * 0.6}
            >
              <animate
                attributeName="opacity"
                values={`${0.3 + cell.density * 0.6};${0.2 + cell.density * 0.5};${0.3 + cell.density * 0.6}`}
                dur={`${1.5 + Math.random()}s`}
                repeatCount="indefinite"
              />
            </rect>
          );
        })}

        {/* Field center */}
        <ellipse cx="120" cy="120" rx="40" ry="35" fill="#1a4a2e" stroke="#2d7a4f" strokeWidth="1" />
        <text x="120" y="118" textAnchor="middle" fill="#2d7a4f" fontSize="7" fontWeight="bold">FIELD</text>

        {/* Color scale */}
        <defs>
          <linearGradient id="heatScale" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00a850" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <rect x="20" y="228" width="200" height="6" rx="3" fill="url(#heatScale)" />
        <text x="20" y="242" fill="#64748b" fontSize="7">Low</text>
        <text x="110" y="242" textAnchor="middle" fill="#64748b" fontSize="7">Medium</text>
        <text x="220" y="242" textAnchor="end" fill="#64748b" fontSize="7">High</text>
      </svg>
    </div>
  );
}

// ─── Trend Chart ───────────────────────────────────────────
function OccupancyTrend() {
  const now = new Date();
  const data = Array.from({ length: 12 }, (_, i) => {
    const h = (now.getHours() - 11 + i + 24) % 24;
    const base = h >= 17 && h <= 21 ? 0.8 : h >= 12 && h <= 16 ? 0.5 : 0.2;
    return {
      time: `${h}:00`,
      occupancy: Math.round((base + (Math.random() - 0.5) * 0.1) * 100),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: '#0f1e35', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#60a5fa' }}
          formatter={(v: number) => [`${v}%`, 'Occupancy']}
        />
        <Area type="monotone" dataKey="occupancy" stroke="#3b82f6" fill="url(#occGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function CrowdPage() {
  const { crowdData, heatmapData, startAutoRefresh, stopAutoRefresh, isLoading } = useCrowdStore();
  const { language } = useAppStore();
  const [aiSummary, setAiSummary] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, []);

  const fetchAISummary = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/crowd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crowdData, language }),
      });
      const data = await res.json() as { summary: string };
      setAiSummary(data.summary);
    } catch {
      setAiSummary('AI analysis unavailable. Check individual zone displays for current status.');
    } finally {
      setIsLoadingAI(false);
    }
  }, [crowdData, language]);

  useEffect(() => { void fetchAISummary(); }, []);

  const zones = crowdData?.zones ?? [];
  const totalPct = crowdData
    ? Math.round((crowdData.totalOccupancy / crowdData.totalCapacity) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 container py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users size={20} className="text-amber-400" />
                <h1 className="font-display font-bold text-2xl">Crowd Intelligence</h1>
              </div>
              <p className="text-muted-foreground">Real-time crowd density, congestion prediction, and AI recommendations</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void fetchAISummary()}
                disabled={isLoadingAI}
                className="flex items-center gap-2 glass border border-white/10 rounded-xl px-4 py-2 text-sm hover:border-primary/30 transition-all"
                aria-label="Refresh AI analysis"
              >
                <RefreshCw size={13} className={cn(isLoadingAI && 'animate-spin')} />
                AI Analysis
              </button>
              <div className={cn(
                'flex items-center gap-2 glass rounded-xl px-4 py-2 text-sm border',
                crowdData?.congestionLevel === 'critical' ? 'border-red-500/30 text-red-400' :
                crowdData?.congestionLevel === 'high' ? 'border-orange-500/30 text-orange-400' :
                'border-green-500/30 text-green-400'
              )}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
                Live · {totalPct}% Full
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Fans', value: crowdData ? formatNumber(crowdData.totalOccupancy) : '--', icon: <Users size={16} />, color: '#60a5fa' },
            { label: 'Capacity', value: formatPercent(totalPct), icon: <TrendingUp size={16} />, color: '#f59e0b' },
            { label: 'Active Alerts', value: String(crowdData?.alerts.length ?? 0), icon: <AlertTriangle size={16} />, color: '#f87171' },
            { label: 'Congestion', value: crowdData?.congestionLevel ?? '--', icon: <Zap size={16} />, color: '#4ade80' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: kpi.color }}>
                {kpi.icon}
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold font-display capitalize">{kpi.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-1 glass rounded-2xl p-6 border border-white/5"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Live Heatmap
            </h2>
            <HeatmapGrid data={heatmapData.length > 0 ? heatmapData : generateHeatmapData()} />
          </motion.div>

          {/* Zone List + Trend */}
          <div className="lg:col-span-2 space-y-6">
            {/* Occupancy Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <h2 className="font-semibold mb-4">Occupancy Trend (Today)</h2>
              <OccupancyTrend />
            </motion.div>

            {/* Zone Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <h2 className="font-semibold mb-4">Zone Breakdown</h2>
              <div className="space-y-3">
                {zones.slice(0, 6).map(zone => {
                  const pct = Math.round(zone.density * 100);
                  const color = getCongestionColor(zone.density);
                  return (
                    <div key={zone.zoneId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium">{zone.zoneName}</span>
                        <span className="text-muted-foreground">{zone.current.toLocaleString()} / {zone.capacity.toLocaleString()} · <span style={{ color }}>{pct}%</span></span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass rounded-2xl p-6 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className="text-primary" />
            <h2 className="font-semibold">AI Crowd Intelligence Summary</h2>
            {isLoadingAI && <RefreshCw size={13} className="animate-spin text-muted-foreground ml-auto" />}
          </div>
          {aiSummary ? (
            <p className="text-muted-foreground text-sm leading-relaxed">{aiSummary}</p>
          ) : (
            <div className="space-y-2">
              {[80, 60, 90].map((w, i) => (
                <div key={i} className="h-4 bg-muted rounded shimmer" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Active Alerts */}
        {crowdData?.alerts && crowdData.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" /> Active Alerts
            </h2>
            <div className="space-y-2">
              {crowdData.alerts.map(alert => (
                <div key={alert.id} className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border text-sm',
                  alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-400'
                )}>
                  <AlertTriangle size={14} />
                  <span className="flex-1 text-foreground">{alert.message}</span>
                  <span className="text-xs opacity-70">{alert.zone}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
