'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import {
  BarChart3, Users, AlertTriangle, Leaf, Bus, Heart, Brain,
  TrendingUp, TrendingDown, RefreshCw, Activity, Zap, Droplets
} from 'lucide-react';
import { useCrowdStore } from '@/store/use-crowd-store';
import { useAppStore } from '@/store/use-app-store';
import { generateSustainabilityData } from '@/lib/crowd-simulation';
import { formatNumber, getCongestionColor, cn } from '@/lib/utils';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// ─── Animated Counter Card ─────────────────────────────────
function KPICard({
  label, value, unit, icon, color, trend, trendValue, delay = 0,
}: {
  label: string; value: string | number; unit?: string; icon: React.ReactNode;
  color: string; trend?: 'up' | 'down'; trendValue?: number; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-white/15 transition-all"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}10 0%, transparent 60%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2" style={{ color }}>
            {icon}
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          {trend && (
            <div className={cn('flex items-center gap-0.5 text-xs font-semibold', trend === 'up' ? 'text-green-400' : 'text-red-400')}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendValue}%
            </div>
          )}
        </div>
        <div className="text-3xl font-black font-display" style={{ color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="text-base ml-1 opacity-70">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Generate time series data ─────────────────────────────
function generateTimeData(points = 24) {
  return Array.from({ length: points }, (_, i) => {
    const h = i;
    const base = h >= 17 && h <= 21 ? 0.85 : h >= 12 && h <= 16 ? 0.55 : h >= 9 && h <= 11 ? 0.35 : 0.1;
    return {
      time: `${String(h).padStart(2, '0')}:00`,
      crowd: Math.round((base + (Math.random() - 0.5) * 0.08) * 100),
      incidents: Math.floor(Math.random() * (base > 0.6 ? 4 : 1)),
      power: Math.round(base * 25000 + Math.random() * 2000),
    };
  });
}

export default function DashboardPage() {
  const { crowdData, startAutoRefresh, stopAutoRefresh } = useCrowdStore();
  const { language } = useAppStore();
  const [sustainability, setSustainability] = useState(generateSustainabilityData());
  const [timeData] = useState(generateTimeData);
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    startAutoRefresh();
    const t = setInterval(() => setSustainability(generateSustainabilityData()), 20000);
    return () => { stopAutoRefresh(); clearInterval(t); };
  }, []);

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoadingAI(true);
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Generate a 3-sentence operational insight for stadium organizers based on current conditions: high crowd density in North sections, Metro running smoothly, recycling at 67%. Include one recommendation.',
            history: [],
            language,
          }),
        });
        const data = await res.json() as { reply: string };
        setAiInsight(data.reply);
      } catch {
        setAiInsight('📊 Operations are running smoothly. Section A-B corridor shows elevated density (88%) — recommend opening Gate 3 extension to redirect flow. Power consumption is 12% below target thanks to solar generation. Volunteer deployment in Zone C is optimal.');
      } finally {
        setIsLoadingAI(false);
      }
    };
    void fetchInsight();
  }, [language]);

  const totalPct = crowdData
    ? Math.round((crowdData.totalOccupancy / crowdData.totalCapacity) * 100)
    : 78;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 container py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={20} className="text-primary" />
                <h1 className="font-display font-bold text-2xl">Organizer Dashboard</h1>
              </div>
              <p className="text-muted-foreground">Real-time stadium operations overview · MetLife Stadium</p>
            </div>
            <div className="flex items-center gap-3 glass border border-white/10 rounded-xl px-4 py-2 text-sm">
              <Activity size={14} className="text-green-400 animate-pulse" />
              <span className="text-green-400 font-semibold">Live</span>
              <span className="text-muted-foreground">Match Day Operations</span>
            </div>
          </div>
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard label="Total Fans" value={crowdData ? formatNumber(crowdData.totalOccupancy) : '64,230'} icon={<Users size={15} />} color="#60a5fa" trend="up" trendValue={12} delay={0} />
          <KPICard label="Stadium Full" value={`${totalPct}%`} icon={<BarChart3 size={15} />} color="#f59e0b" trend="up" trendValue={5} delay={0.05} />
          <KPICard label="Active Alerts" value={crowdData?.alerts.length ?? 2} icon={<AlertTriangle size={15} />} color="#f87171" delay={0.1} />
          <KPICard label="Eco Score" value={sustainability.ecoScore} unit="/100" icon={<Leaf size={15} />} color="#4ade80" trend="up" trendValue={3} delay={0.15} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Crowd Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Users size={16} className="text-primary" /> Today&apos;s Crowd Flow
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#0f1e35', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`${v}%`, 'Occupancy']}
                />
                <Area type="monotone" dataKey="crowd" stroke="#3b82f6" fill="url(#crowdGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Secondary KPIs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
            {[
              { label: 'Energy', value: `${Math.round(sustainability.energyConsumption / 1000)}k kWh`, icon: <Zap size={14} />, color: '#fbbf24', pct: 68 },
              { label: 'Water', value: `${Math.round(sustainability.waterConsumption / 1000)}k L`, icon: <Droplets size={14} />, color: '#60a5fa', pct: 55 },
              { label: 'Recycling', value: `${sustainability.recyclingRate}%`, icon: <Leaf size={14} />, color: '#4ade80', pct: sustainability.recyclingRate },
              { label: 'Volunteers', value: '342 Active', icon: <Heart size={14} />, color: '#e879f9', pct: 88 },
            ].map(item => (
              <div key={item.label} className="glass rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5" style={{ color: item.color }}>
                    {item.icon}
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Zone Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold mb-4">Zone Occupancy</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={(crowdData?.zones ?? []).slice(0, 6).map(z => ({
                name: z.zoneName.replace('Section ', ''),
                value: Math.round(z.density * 100),
                color: getCongestionColor(z.density),
              }))} margin={{ left: -20, right: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ background: '#0f1e35', border: 'none', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v}%`, 'Occupancy']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(crowdData?.zones ?? []).slice(0, 6).map((z, i) => (
                    <Cell key={i} fill={getCongestionColor(z.density)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Incident Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold mb-4">Incident Timeline</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={timeData.slice(12)} margin={{ left: -20, right: 5 }}>
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f1e35', border: 'none', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* AI Operational Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Brain size={16} className="text-primary" /> AI Operational Intelligence
            </h2>
            {isLoadingAI && <RefreshCw size={13} className="animate-spin text-muted-foreground" />}
          </div>
          {aiInsight ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight}</p>
          ) : (
            <div className="space-y-2">
              {[85, 65, 75].map((w, i) => <div key={i} className="h-4 bg-muted rounded shimmer" style={{ width: `${w}%` }} />)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
