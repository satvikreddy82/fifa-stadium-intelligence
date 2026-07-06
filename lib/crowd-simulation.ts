// ============================================================
// FIFA StadiumIQ 2026 – Real-time Crowd Data Simulation
// ============================================================
import type { CrowdData, ZoneOccupancy, CrowdAlert } from '@/types';
import { generateId, randomBetween, getCongestionLabel } from './utils';
import { DEFAULT_STADIUM } from './stadium-data';

// Match phases drive crowd behavior
type MatchPhase = 'pre_match' | 'first_half' | 'half_time' | 'second_half' | 'post_match' | 'idle';

function getCurrentPhase(): MatchPhase {
  const hour = new Date().getHours();
  if (hour >= 17 && hour < 18) return 'pre_match';
  if (hour >= 18 && hour < 19) return 'first_half';
  if (hour === 19) return 'half_time';
  if (hour >= 19 && hour < 21) return 'second_half';
  if (hour >= 21 && hour < 22) return 'post_match';
  return 'idle';
}

// Multipliers by match phase
const PHASE_MULTIPLIERS: Record<MatchPhase, number> = {
  idle: 0.15,
  pre_match: 0.75,
  first_half: 0.92,
  half_time: 0.98, // people moving around
  second_half: 0.88,
  post_match: 0.65,
};

// ─── Generate Crowd Data ────────────────────────────────────
export function generateCrowdData(): CrowdData {
  const phase = getCurrentPhase();
  const baseMultiplier = PHASE_MULTIPLIERS[phase];

  const zones: ZoneOccupancy[] = DEFAULT_STADIUM.zones.map(zone => {
    // Add some random variation per zone
    const zoneVariation = randomBetween(0.8, 1.2);
    const density = Math.min(1, baseMultiplier * zoneVariation);
    const current = Math.floor(zone.capacity * density);

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      current,
      capacity: zone.capacity,
      density,
      trend: Math.random() > 0.6 ? 'increasing' : Math.random() > 0.4 ? 'stable' : 'decreasing',
      congestionLevel: getCongestionLabel(density),
    };
  });

  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const totalOccupancy = zones.reduce((sum, z) => sum + z.current, 0);
  const overallDensity = totalOccupancy / totalCapacity;

  return {
    timestamp: new Date(),
    zones,
    totalOccupancy,
    totalCapacity,
    congestionLevel: getCongestionLabel(overallDensity),
    alerts: generateAlerts(zones),
  };
}

// ─── Alert Generator ────────────────────────────────────────
function generateAlerts(zones: ZoneOccupancy[]): CrowdAlert[] {
  const alerts: CrowdAlert[] = [];

  zones.forEach(zone => {
    if (zone.density > 0.9) {
      alerts.push({
        id: generateId(),
        type: 'overflow',
        message: `${zone.zoneName} is at ${Math.floor(zone.density * 100)}% capacity — approaching maximum`,
        zone: zone.zoneName,
        severity: 'critical',
        timestamp: new Date(),
      });
    } else if (zone.density > 0.75 && zone.trend === 'increasing') {
      alerts.push({
        id: generateId(),
        type: 'congestion',
        message: `${zone.zoneName} density rising — consider alternate routing`,
        zone: zone.zoneName,
        severity: 'warning',
        timestamp: new Date(),
      });
    }
  });

  // Occasional incident alerts
  if (Math.random() < 0.05) {
    alerts.push({
      id: generateId(),
      type: 'incident',
      message: 'Minor incident reported near concession stand — security dispatched',
      zone: 'Section D',
      severity: 'warning',
      timestamp: new Date(),
    });
  }

  return alerts;
}

// ─── Heatmap Cell Generator ────────────────────────────────
export interface HeatmapCell {
  x: number;
  y: number;
  density: number;
  label: string;
}

export function generateHeatmapData(gridSize = 12): HeatmapCell[] {
  const phase = getCurrentPhase();
  const base = PHASE_MULTIPLIERS[phase];
  const cells: HeatmapCell[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Stadium is oval — calculate distance from center
      const cx = gridSize / 2 - 0.5;
      const cy = gridSize / 2 - 0.5;
      const dx = (col - cx) / (gridSize / 2);
      const dy = (row - cy) / (gridSize / 2.5); // Oval shape
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Stadium seating is in a ring — not center, not outside
      const isSeating = distFromCenter > 0.4 && distFromCenter < 1.0;
      const isField = distFromCenter < 0.4;

      let density = 0;
      if (isSeating) {
        // Simulate crowd patterns: gates have higher density
        const gateNorth = Math.max(0, 0.3 - Math.abs(col - cx) * 0.2) * (row < 2 ? 3 : 1);
        const gateSouth = Math.max(0, 0.3 - Math.abs(col - cx) * 0.2) * (row > gridSize - 3 ? 3 : 1);
        const baseNoise = randomBetween(-0.1, 0.15);
        density = Math.min(1, Math.max(0, base + baseNoise + gateNorth + gateSouth));
      } else if (isField) {
        density = 0; // Field is empty
      } else {
        density = 0; // Outside stadium
      }

      cells.push({
        x: col,
        y: row,
        density,
        label: isField ? 'Field' : isSeating ? `Section ${String.fromCharCode(65 + (row % 8))}` : 'Outside',
      });
    }
  }

  return cells;
}

// ─── Transport Simulation ──────────────────────────────────
export interface TransportStatus {
  metro: { available: boolean; nextArrival: number; crowding: 'low' | 'medium' | 'high' };
  bus: { available: boolean; nextArrival: number; crowding: 'low' | 'medium' | 'high' };
  parking: { lotA: number; lotB: number; lotC: number; accessible: number };
}

export function generateTransportStatus(): TransportStatus {
  const phase = getCurrentPhase();
  const isActive = phase !== 'idle';

  return {
    metro: {
      available: true,
      nextArrival: Math.floor(randomBetween(2, isActive ? 8 : 15)),
      crowding: isActive ? (Math.random() > 0.5 ? 'high' : 'medium') : 'low',
    },
    bus: {
      available: true,
      nextArrival: Math.floor(randomBetween(5, isActive ? 15 : 25)),
      crowding: isActive ? (Math.random() > 0.7 ? 'medium' : 'low') : 'low',
    },
    parking: {
      lotA: Math.floor(randomBetween(isActive ? 10 : 30, isActive ? 30 : 80)),
      lotB: Math.floor(randomBetween(isActive ? 20 : 40, isActive ? 50 : 90)),
      lotC: Math.floor(randomBetween(isActive ? 30 : 60, isActive ? 70 : 95)),
      accessible: Math.floor(randomBetween(60, 95)),
    },
  };
}

// ─── Sustainability Simulation ─────────────────────────────
export function generateSustainabilityData() {
  const phase = getCurrentPhase();
  const multiplier = PHASE_MULTIPLIERS[phase];

  return {
    carbonEmissions: Math.round(randomBetween(800, 1200) * multiplier),
    energyConsumption: Math.round(randomBetween(15000, 25000) * multiplier),
    waterConsumption: Math.round(randomBetween(50000, 80000) * multiplier),
    wasteGenerated: Math.round(randomBetween(2000, 5000) * multiplier),
    recyclingRate: Math.round(randomBetween(55, 75)),
    renewableEnergyShare: Math.round(randomBetween(35, 55)),
    ecoScore: Math.round(randomBetween(65, 82)),
    timestamp: new Date(),
  };
}
