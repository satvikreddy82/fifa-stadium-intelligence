import { describe, it, expect } from 'vitest';
import { generateCrowdData, generateHeatmapData, generateTransportStatus, generateSustainabilityData } from '@/lib/crowd-simulation';

describe('Crowd Simulation', () => {
  describe('generateCrowdData', () => {
    it('returns valid crowd data structure', () => {
      const data = generateCrowdData();
      expect(data).toBeDefined();
      expect(data.zones).toBeDefined();
      expect(Array.isArray(data.zones)).toBe(true);
      expect(data.zones.length).toBeGreaterThan(0);
      expect(data.totalCapacity).toBeGreaterThan(0);
      expect(data.totalOccupancy).toBeGreaterThanOrEqual(0);
      expect(data.totalOccupancy).toBeLessThanOrEqual(data.totalCapacity);
    });

    it('zones have valid density values (0-1)', () => {
      const data = generateCrowdData();
      data.zones.forEach(zone => {
        expect(zone.density).toBeGreaterThanOrEqual(0);
        expect(zone.density).toBeLessThanOrEqual(1);
      });
    });

    it('congestion level is a valid enum value', () => {
      const data = generateCrowdData();
      const validLevels = ['low', 'moderate', 'high', 'critical'];
      expect(validLevels).toContain(data.congestionLevel);
    });

    it('zone occupancy does not exceed capacity', () => {
      const data = generateCrowdData();
      data.zones.forEach(zone => {
        expect(zone.current).toBeLessThanOrEqual(zone.capacity);
        expect(zone.current).toBeGreaterThanOrEqual(0);
      });
    });

    it('alerts are an array', () => {
      const data = generateCrowdData();
      expect(Array.isArray(data.alerts)).toBe(true);
    });

    it('timestamp is a Date', () => {
      const data = generateCrowdData();
      expect(data.timestamp instanceof Date).toBe(true);
    });
  });

  describe('generateHeatmapData', () => {
    it('returns correct grid size', () => {
      const data = generateHeatmapData(12);
      expect(data.length).toBe(12 * 12);
    });

    it('cells have valid x, y coordinates', () => {
      const data = generateHeatmapData(8);
      data.forEach(cell => {
        expect(cell.x).toBeGreaterThanOrEqual(0);
        expect(cell.x).toBeLessThan(8);
        expect(cell.y).toBeGreaterThanOrEqual(0);
        expect(cell.y).toBeLessThan(8);
      });
    });

    it('density values are between 0 and 1', () => {
      const data = generateHeatmapData();
      data.forEach(cell => {
        expect(cell.density).toBeGreaterThanOrEqual(0);
        expect(cell.density).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('generateTransportStatus', () => {
    it('returns all required fields', () => {
      const status = generateTransportStatus();
      expect(status.metro).toBeDefined();
      expect(status.bus).toBeDefined();
      expect(status.parking).toBeDefined();
    });

    it('metro next arrival is positive', () => {
      const status = generateTransportStatus();
      expect(status.metro.nextArrival).toBeGreaterThan(0);
    });

    it('parking percentages are valid', () => {
      const status = generateTransportStatus();
      const lots = [status.parking.lotA, status.parking.lotB, status.parking.lotC, status.parking.accessible];
      lots.forEach(pct => {
        expect(pct).toBeGreaterThanOrEqual(0);
        expect(pct).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('generateSustainabilityData', () => {
    it('eco score is between 0 and 100', () => {
      const data = generateSustainabilityData();
      expect(data.ecoScore).toBeGreaterThanOrEqual(0);
      expect(data.ecoScore).toBeLessThanOrEqual(100);
    });

    it('recycling rate is valid percentage', () => {
      const data = generateSustainabilityData();
      expect(data.recyclingRate).toBeGreaterThanOrEqual(0);
      expect(data.recyclingRate).toBeLessThanOrEqual(100);
    });

    it('renewable energy share is valid percentage', () => {
      const data = generateSustainabilityData();
      expect(data.renewableEnergyShare).toBeGreaterThanOrEqual(0);
      expect(data.renewableEnergyShare).toBeLessThanOrEqual(100);
    });
  });
});
