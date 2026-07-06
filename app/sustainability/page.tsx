'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Leaf, Zap, Droplets, Trash2, Brain, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { generateSustainabilityData } from '@/lib/crowd-simulation';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

function EcoGauge({ value, max, label, color, icon }: { value: number; max: number; label: string; color: string; icon: React.ReactNode }) {
  const pct = Math.round((value / max) * 100);
  const data = [{ value: pct }, { value: 100 - pct }];

  return (
    <div className="glass rounded-2xl p-5 border border-white/5 text-center">
      <div className="relative h-28 w-28 mx-auto mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: pct, fill: color }]} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: '#1e2a3a' }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div style={{ color }} className="mb-0.5">{icon}</div>
          <div className="text-lg font-bold" style={{ color }}>{pct}%</div>
        </div>
      </div>
      <div className="font-semibold text-sm">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{value.toLocaleString()} {label.includes('Energy') ? 'kWh' : label.includes('Carbon') ? 'kg CO₂' : label.includes('Water') ? 'L' : 'kg'}</div>
    </div>
  );
}

export default function SustainabilityPage() {
  const { language } = useAppStore();
  const [metrics, setMetrics] = useState(generateSustainabilityData());
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setMetrics(generateSustainabilityData()), 15000);
    return () => clearInterval(t);
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/sustainability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, language }),
      });
      const data = await res.json() as { insights: string };
      setInsights(data.insights);
    } catch {
      setInsights('🌱 Today\'s eco performance is tracking well. Solar panels are generating 42% of stadium power. Encourage fans to use recycling bins — current recycling rate is 67%. Consider activating LED dimming in Lot C to save ~180 kWh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void fetchInsights(); }, []);

  const wasteData = [
    { name: 'Recycled', value: metrics.recyclingRate, color: '#4ade80' },
    { name: 'Landfill', value: 100 - metrics.recyclingRate, color: '#374151' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 container py-8">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Leaf size={20} className="text-green-400" />
                <h1 className="font-display font-bold text-2xl">Sustainability Dashboard</h1>
              </div>
              <p className="text-muted-foreground">Real-time environmental impact monitoring and AI eco recommendations</p>
            </div>
            {/* Eco Score */}
            <div className="glass rounded-2xl px-6 py-3 border border-green-500/30 text-center">
              <div className="text-3xl font-black text-green-400">{metrics.ecoScore}</div>
              <div className="text-xs text-muted-foreground">Eco Score / 100</div>
            </div>
          </div>
        </motion.div>

        {/* Metric Gauges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <EcoGauge value={metrics.carbonEmissions} max={1500} label="Carbon Emissions" color="#f87171" icon={<span className="text-lg">☁️</span>} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <EcoGauge value={metrics.energyConsumption} max={30000} label="Energy Usage" color="#fbbf24" icon={<Zap size={16} />} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <EcoGauge value={metrics.waterConsumption} max={100000} label="Water Usage" color="#60a5fa" icon={<Droplets size={16} />} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <EcoGauge value={metrics.wasteGenerated} max={6000} label="Waste Generated" color="#a78bfa" icon={<Trash2 size={16} />} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Renewable Energy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" /> Energy Mix
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: 'Renewable', value: metrics.renewableEnergyShare },
                      { name: 'Grid', value: 100 - metrics.renewableEnergyShare },
                    ]} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" dataKey="value" paddingAngle={3}>
                      <Cell fill="#4ade80" />
                      <Cell fill="#374151" />
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f1e35', border: 'none', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-bold text-green-400">{metrics.renewableEnergyShare}%</div>
                  <div className="text-xs text-muted-foreground">Solar</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Solar Panels', pct: metrics.renewableEnergyShare, color: '#4ade80' },
                  { label: 'City Grid', pct: 100 - metrics.renewableEnergyShare, color: '#374151' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-semibold" style={{ color: item.color }}>{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recycling */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Trash2 size={16} className="text-green-400" /> Waste Management
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={wasteData} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" dataKey="value" paddingAngle={3}>
                      {wasteData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-bold text-green-400">{metrics.recyclingRate}%</div>
                  <div className="text-xs text-muted-foreground">Recycled</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span>Recycled: {metrics.recyclingRate}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-600" />
                  <span>Landfill: {100 - metrics.recyclingRate}%</span>
                </div>
                <div className="mt-3 p-2 bg-green-500/10 rounded-lg text-green-400 text-xs">
                  🎯 Target: 75% recycling rate
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Brain size={16} className="text-green-400" /> AI Eco Intelligence
            </h2>
            <button onClick={() => void fetchInsights()} disabled={isLoading} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw size={11} className={cn(isLoading && 'animate-spin')} /> Refresh
            </button>
          </div>
          {insights ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{insights}</p>
          ) : (
            <div className="space-y-2">
              {[90, 70, 80].map((w, i) => <div key={i} className="h-4 bg-muted rounded shimmer" style={{ width: `${w}%` }} />)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
