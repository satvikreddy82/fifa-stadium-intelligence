'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Bus, Train, Car, Footprints, Brain, RefreshCw, Leaf, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { useCrowdStore } from '@/store/use-crowd-store';
import { cn, formatNumber } from '@/lib/utils';

const METRO_LINES = [
  { line: 'Line 2 (Blue)', station: 'Stadium Station', interval: '8 min', crowding: 'high', stops: 3 },
  { line: 'Line 4 (Green)', station: 'Central Park Stn', interval: '12 min', crowding: 'medium', stops: 5 },
];

const BUS_ROUTES = [
  { route: 'Route 45', from: 'Downtown Hub', duration: '22 min', crowding: 'low', stops: 7 },
  { route: 'Route 67', from: 'Airport Terminal 1', duration: '35 min', crowding: 'medium', stops: 12 },
  { route: 'Route 23 Express', from: 'Convention Center', duration: '15 min', crowding: 'low', stops: 3 },
];

const TRANSPORT_TABS = [
  { id: 'all', label: 'All Options', icon: <MapPin size={14} /> },
  { id: 'metro', label: 'Metro', icon: <Train size={14} /> },
  { id: 'bus', label: 'Bus', icon: <Bus size={14} /> },
  { id: 'parking', label: 'Parking', icon: <Car size={14} /> },
  { id: 'walk', label: 'Walking', icon: <Footprints size={14} /> },
];

function CrowdingBadge({ level }: { level: string }) {
  return (
    <span className={cn(
      'text-xs px-2 py-0.5 rounded-full font-medium',
      level === 'high' ? 'badge-critical' : level === 'medium' ? 'badge-moderate' : 'badge-low'
    )}>
      {level === 'high' ? '🔴 Crowded' : level === 'medium' ? '🟡 Moderate' : '🟢 Clear'}
    </span>
  );
}

export default function TransportPage() {
  const { language } = useAppStore();
  const { transportStatus, startAutoRefresh, stopAutoRefresh } = useCrowdStore();
  const [activeTab, setActiveTab] = useState('all');
  const [aiTip, setAiTip] = useState('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, []);

  useEffect(() => {
    const fetchTip = async () => {
      setIsLoadingTip(true);
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Give a short 2-sentence transport tip for fans leaving the stadium after the match. Include eco-friendly option.',
            history: [],
            language,
          }),
        });
        const data = await res.json() as { reply: string };
        setAiTip(data.reply);
      } catch {
        setAiTip('🚇 Take Metro Line 2 from Stadium Station for the fastest, eco-friendly journey. EV shuttles from Lot B depart every 5 minutes to the main metro hub.');
      } finally {
        setIsLoadingTip(false);
      }
    };
    void fetchTip();
  }, [language]);

  const parking = transportStatus?.parking ?? { lotA: 45, lotB: 62, lotC: 78, accessible: 89 };
  const metro = transportStatus?.metro ?? { available: true, nextArrival: 6, crowding: 'medium' };
  const bus = transportStatus?.bus ?? { available: true, nextArrival: 12, crowding: 'low' };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 container py-8 max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Bus size={20} className="text-green-400" />
            <h1 className="font-display font-bold text-2xl">Transportation Hub</h1>
          </div>
          <p className="text-muted-foreground">Metro, bus, parking, and walking routes with live availability</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scroll">
          {TRANSPORT_TABS.map(tab => (
            <button
              key={tab.id}
              id={`transport-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'glass border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
              )}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* AI Transport Tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 border border-green-500/20 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-green-400" />
            <span className="font-semibold text-sm">AI Transport Recommendation</span>
            {isLoadingTip && <RefreshCw size={12} className="animate-spin text-muted-foreground ml-auto" />}
          </div>
          {aiTip ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{aiTip}</p>
          ) : (
            <div className="h-4 bg-muted rounded shimmer w-3/4" />
          )}
        </motion.div>

        {/* Metro */}
        {(activeTab === 'all' || activeTab === 'metro') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Train size={16} className="text-blue-400" /> Metro Lines
            </h2>
            <div className="space-y-3">
              {METRO_LINES.map((line, i) => (
                <div key={i} className="glass rounded-xl p-4 border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Train size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{line.line}</div>
                    <div className="text-xs text-muted-foreground">{line.station} · {line.stops} stops</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm font-medium text-blue-400 mb-1">
                      <Clock size={12} /> Next: {metro.nextArrival} min
                    </div>
                    <CrowdingBadge level={metro.crowding} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bus */}
        {(activeTab === 'all' || activeTab === 'bus') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Bus size={16} className="text-purple-400" /> Bus Routes
            </h2>
            <div className="space-y-3">
              {BUS_ROUTES.map((route, i) => (
                <div key={i} className="glass rounded-xl p-4 border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Bus size={18} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{route.route}</div>
                    <div className="text-xs text-muted-foreground">From {route.from} · {route.stops} stops</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm font-medium text-purple-400 mb-1">
                      <Clock size={12} /> {route.duration}
                    </div>
                    <CrowdingBadge level={bus.crowding} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Parking */}
        {(activeTab === 'all' || activeTab === 'parking') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Car size={16} className="text-amber-400" /> Parking Availability
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Lot A (North)', pct: parking.lotA, walk: '8 min', accessible: false },
                { name: 'Lot B (South)', pct: parking.lotB, walk: '5 min', accessible: false },
                { name: 'Lot C (East)', pct: parking.lotC, walk: '12 min', accessible: false },
                { name: 'Accessible Lot', pct: parking.accessible, walk: '3 min', accessible: true },
              ].map(lot => {
                const available = 100 - lot.pct;
                const color = available > 40 ? '#4ade80' : available > 20 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={lot.name} className="glass rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{lot.name}</span>
                      {lot.accessible && <span className="text-xs text-green-400">♿</span>}
                    </div>
                    <div className="text-2xl font-bold" style={{ color }}>{available}%</div>
                    <div className="text-xs text-muted-foreground mb-2">Available · {lot.walk} walk</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${available}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Walking */}
        {(activeTab === 'all' || activeTab === 'walk') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Footprints size={16} className="text-green-400" /> Walking Routes
            </h2>
            <div className="space-y-3">
              {[
                { from: 'Central Park', distance: '1.2 km', time: '15 min', eco: 10 },
                { from: 'Downtown Metro Hub', distance: '0.8 km', time: '10 min', eco: 10 },
                { from: 'Convention Center', distance: '2.1 km', time: '25 min', eco: 10 },
              ].map((route, i) => (
                <div key={i} className="glass rounded-xl p-4 border border-green-500/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                    <Footprints size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">From {route.from}</div>
                    <div className="text-xs text-muted-foreground">{route.distance} · {route.time}</div>
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                    <Leaf size={12} /> Zero emissions
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
