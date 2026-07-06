// ============================================================
// FIFA StadiumIQ 2026 – Crowd Data Store (Zustand)
// ============================================================
import { create } from 'zustand';
import type { CrowdData, ZoneOccupancy } from '@/types';
import { generateCrowdData, generateHeatmapData, generateTransportStatus, type HeatmapCell, type TransportStatus } from '@/lib/crowd-simulation';

interface CrowdState {
  crowdData: CrowdData | null;
  heatmapData: HeatmapCell[];
  transportStatus: TransportStatus | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  updateInterval: number; // ms

  // Actions
  refreshData: () => void;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  getZoneById: (id: string) => ZoneOccupancy | undefined;
  getCriticalZones: () => ZoneOccupancy[];
}

let refreshTimer: ReturnType<typeof setInterval> | null = null;

export const useCrowdStore = create<CrowdState>((set, get) => ({
  crowdData: null,
  heatmapData: [],
  transportStatus: null,
  isLoading: false,
  lastUpdated: null,
  updateInterval: 10000, // 10 seconds

  refreshData: () => {
    set({ isLoading: true });
    try {
      const crowdData = generateCrowdData();
      const heatmapData = generateHeatmapData();
      const transportStatus = generateTransportStatus();
      set({ crowdData, heatmapData, transportStatus, isLoading: false, lastUpdated: new Date() });
    } catch {
      set({ isLoading: false });
    }
  },

  startAutoRefresh: () => {
    if (refreshTimer) clearInterval(refreshTimer);
    get().refreshData();
    refreshTimer = setInterval(() => {
      get().refreshData();
    }, get().updateInterval);
  },

  stopAutoRefresh: () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  },

  getZoneById: (id) => get().crowdData?.zones.find(z => z.zoneId === id),

  getCriticalZones: () =>
    get().crowdData?.zones.filter(z => z.congestionLevel === 'critical' || z.congestionLevel === 'high') ?? [],
}));
