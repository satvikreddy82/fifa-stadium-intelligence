'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/navbar';
import { MapPin, Navigation, Accessibility, Search, ChevronRight, Zap, RotateCcw, Info } from 'lucide-react';
import { STADIUM_NODES, DEFAULT_STADIUM, EMERGENCY_ASSETS } from '@/lib/stadium-data';
import { findPath, buildNavigationRoute } from '@/lib/pathfinding';
import type { NavigationRoute } from '@/types';
import { cn, formatNumber } from '@/lib/utils';

// Dynamically import map to avoid SSR issues with Leaflet
const StadiumMapView = dynamic(() => import('@/components/map/stadium-map'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-card/50 rounded-2xl">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-muted-foreground text-sm">Loading map...</p>
    </div>
  </div>
) });

const QUICK_DESTINATIONS = [
  { id: 'n5', label: '🚻 Nearest Restroom', icon: '🚻' },
  { id: 'n9', label: '🍔 Food Court', icon: '🍔' },
  { id: 'n13', label: 'ℹ️ Information Desk', icon: 'ℹ️' },
  { id: 'n14', label: '🛗 Elevator A (L2)', icon: '🛗' },
  { id: 'n3', label: '🚪 Gate 3 (Short Queue)', icon: '🚪' },
  { id: 'med-e1', label: '🏥 First Aid Station', icon: '🏥' },
];

export default function StadiumPage() {
  const [fromNode, setFromNode] = useState('n1');
  const [toNode, setToNode] = useState('n5');
  const [accessible, setAccessible] = useState(false);
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stadiumInfo, setStadiumInfo] = useState(DEFAULT_STADIUM);

  const calculateRoute = () => {
    const path = findPath(fromNode, toNode, STADIUM_NODES, accessible);
    if (path) {
      const nav = buildNavigationRoute(path, accessible);
      setRoute(nav);
      setCurrentStep(0);
      setIsNavigating(true);
    }
  };

  useEffect(() => { calculateRoute(); }, []);

  const goToQuickDest = (nodeId: string) => {
    setToNode(nodeId);
    const path = findPath(fromNode, nodeId, STADIUM_NODES, accessible);
    if (path) {
      setRoute(buildNavigationRoute(path, accessible));
      setCurrentStep(0);
      setIsNavigating(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex flex-col lg:flex-row h-screen overflow-hidden">

        {/* ── Left Panel ── */}
        <div className="w-full lg:w-96 flex flex-col border-r border-border overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border shrink-0">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={18} className="text-primary" />
                <h1 className="font-display font-bold text-xl">Stadium Navigator</h1>
              </div>
              <p className="text-muted-foreground text-sm">{stadiumInfo.name} · {stadiumInfo.city}</p>
            </motion.div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                id="location-search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search gates, sections, amenities..."
                className="w-full bg-secondary rounded-xl pl-9 pr-4 py-2.5 text-sm border border-border outline-none focus:border-primary transition-colors"
                aria-label="Search stadium locations"
              />
            </div>
          </div>

          {/* Route Planner */}
          <div className="p-4 border-b border-border shrink-0">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Route Planner</h2>
            <div className="space-y-2">
              <div>
                <label htmlFor="from-select" className="text-xs text-muted-foreground mb-1 block">From</label>
                <select
                  id="from-select"
                  value={fromNode}
                  onChange={e => setFromNode(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  {STADIUM_NODES.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="to-select" className="text-xs text-muted-foreground mb-1 block">To</label>
                <select
                  id="to-select"
                  value={toNode}
                  onChange={e => setToNode(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  {STADIUM_NODES.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="accessible-route"
                  checked={accessible}
                  onChange={e => setAccessible(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                  <Accessibility size={13} /> Wheelchair accessible route
                </span>
              </label>

              <button
                id="calculate-route"
                onClick={calculateRoute}
                className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Navigation size={14} /> Calculate Route
              </button>
            </div>
          </div>

          {/* Quick Destinations */}
          <div className="p-4 border-b border-border shrink-0">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Navigation</h2>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_DESTINATIONS.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => goToQuickDest(dest.id)}
                  className="text-left p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/30 transition-all text-xs font-medium"
                >
                  {dest.label}
                </button>
              ))}
            </div>
          </div>

          {/* Route Steps */}
          {route && (
            <div className="flex-1 overflow-y-auto p-4 custom-scroll">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Navigation Steps</h2>
                <div className="text-xs text-muted-foreground">
                  {route.estimatedTimeMinutes} min · {route.totalDistance}m
                </div>
              </div>

              {route.hasElevator && (
                <div className="glass border border-primary/20 rounded-xl p-2.5 mb-3 text-xs text-primary flex items-center gap-2">
                  <Accessibility size={12} /> This route includes elevator access
                </div>
              )}

              <div className="space-y-2">
                {route.steps.map((step, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl border transition-all text-sm',
                      currentStep === i
                        ? 'bg-primary/10 border-primary/30 text-foreground'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:border-border/80'
                    )}
                    aria-current={currentStep === i ? 'step' : undefined}
                  >
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                        currentStep === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        {i + 1}
                      </span>
                      <span>{step.instruction}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {currentStep < route.steps.length - 1 && (
                <button
                  onClick={() => setCurrentStep(s => s + 1)}
                  className="w-full mt-3 bg-amber-500 text-black rounded-xl py-2.5 text-sm font-semibold hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                >
                  Next Step <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Map Panel ── */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <StadiumMapView
            stadium={stadiumInfo}
            route={route}
            currentStep={currentStep}
            nodes={STADIUM_NODES}
            emergencyAssets={EMERGENCY_ASSETS}
          />

          {/* Map overlay stats */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {[
              { label: 'Capacity', value: formatNumber(stadiumInfo.capacity) },
              { label: 'Open Gates', value: '8/8' },
              { label: 'Avg Wait', value: '6 min' },
            ].map(stat => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-xl px-3 py-2 text-center border border-white/10"
              >
                <div className="text-sm font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
