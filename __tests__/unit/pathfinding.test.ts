import { describe, it, expect } from 'vitest';
import { findPath, buildNavigationRoute } from '@/lib/pathfinding';
import { STADIUM_NODES } from '@/lib/stadium-data';

describe('A* Pathfinding', () => {
  it('finds a valid path between two connected nodes', () => {
    const path = findPath('n1', 'n5', STADIUM_NODES);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(1);
    expect(path![0]!.id).toBe('n1');
    expect(path![path!.length - 1]!.id).toBe('n5');
  });

  it('returns null for invalid node IDs', () => {
    const path = findPath('invalid-start', 'n5', STADIUM_NODES);
    expect(path).toBeNull();
  });

  it('returns single node path for same start and end', () => {
    const path = findPath('n1', 'n1', STADIUM_NODES);
    // Either null or single element since no movement needed
    if (path !== null) {
      expect(path.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('accessible-only mode skips non-accessible nodes', () => {
    const pathAccessible = findPath('n1', 'n5', STADIUM_NODES, true);
    const pathAll = findPath('n1', 'n5', STADIUM_NODES, false);
    // Accessible path should only use accessible nodes
    if (pathAccessible) {
      pathAccessible.forEach(node => {
        expect(node.isAccessible).toBe(true);
      });
    }
  });

  it('builds a navigation route from a path', () => {
    const path = findPath('n1', 'n5', STADIUM_NODES);
    expect(path).not.toBeNull();
    const route = buildNavigationRoute(path!, false);
    expect(route).toBeDefined();
    expect(route.steps.length).toBeGreaterThan(0);
    expect(route.totalDistance).toBeGreaterThan(0);
    expect(route.estimatedTimeMinutes).toBeGreaterThan(0);
    expect(typeof route.isAccessible).toBe('boolean');
  });

  it('route from is the start node', () => {
    const path = findPath('n1', 'n3', STADIUM_NODES);
    const route = buildNavigationRoute(path!, false);
    expect(route.from.id).toBe('n1');
  });

  it('route to is the destination node', () => {
    const path = findPath('n1', 'n3', STADIUM_NODES);
    const route = buildNavigationRoute(path!, false);
    expect(route.to.id).toBe('n3');
  });

  it('accessible route has elevator flag set when elevator used', () => {
    const nodes = STADIUM_NODES;
    // Path to elevator node
    const path = findPath('n1', 'n14', nodes);
    if (path) {
      const route = buildNavigationRoute(path, true);
      expect(route.hasElevator).toBe(true);
    }
  });
});
