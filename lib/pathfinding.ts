// ============================================================
// FIFA StadiumIQ 2026 – A* Pathfinding Algorithm
// ============================================================
import type { MapNode, NavigationRoute, RouteStep } from '@/types';
import { STADIUM_NODES } from './stadium-data';

interface PathNode {
  node: MapNode;
  g: number; // Cost from start
  h: number; // Heuristic to goal
  f: number; // Total cost
  parent: PathNode | null;
}

// ─── Euclidean Distance Heuristic ──────────────────────────
function heuristic(a: MapNode, b: MapNode): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const levelPenalty = Math.abs(a.level - b.level) * 200;
  return Math.sqrt(dx * dx + dy * dy) + levelPenalty;
}

function distance(a: MapNode, b: MapNode): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ─── A* Algorithm ──────────────────────────────────────────
export function findPath(
  startId: string,
  endId: string,
  nodes: MapNode[] = STADIUM_NODES,
  accessibleOnly = false
): MapNode[] | null {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const start = nodeMap.get(startId);
  const end = nodeMap.get(endId);

  if (!start || !end) return null;

  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();

  const startPathNode: PathNode = {
    node: start,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null,
  };

  openSet.push(startPathNode);

  while (openSet.length > 0) {
    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    if (current.node.id === endId) {
      return reconstructPath(current);
    }

    closedSet.add(current.node.id);

    for (const connectionId of current.node.connections) {
      if (closedSet.has(connectionId)) continue;

      const neighbor = nodeMap.get(connectionId);
      if (!neighbor) continue;

      // Skip non-accessible nodes if accessible route requested
      if (accessibleOnly && !neighbor.isAccessible) continue;

      const g = current.g + distance(current.node, neighbor);
      const h = heuristic(neighbor, end);
      const f = g + h;

      const existing = openSet.find(p => p.node.id === connectionId);
      if (existing && existing.g <= g) continue;

      if (existing) {
        existing.g = g;
        existing.f = f;
        existing.parent = current;
      } else {
        openSet.push({ node: neighbor, g, h, f, parent: current });
      }
    }
  }

  return null; // No path found
}

function reconstructPath(node: PathNode): MapNode[] {
  const path: MapNode[] = [];
  let current: PathNode | null = node;
  while (current) {
    path.unshift(current.node);
    current = current.parent;
  }
  return path;
}

// ─── Route Builder ─────────────────────────────────────────
export function buildNavigationRoute(
  path: MapNode[],
  isAccessible = false
): NavigationRoute {
  const steps = generateSteps(path);
  const totalDistance = calculateTotalDistance(path);

  return {
    id: `route-${Date.now()}`,
    from: path[0]!,
    to: path[path.length - 1]!,
    steps,
    totalDistance,
    estimatedTimeMinutes: Math.ceil(totalDistance / 80), // ~80 units/min walking
    isAccessible,
    hasElevator: path.some(n => n.type === 'elevator'),
  };
}

function generateSteps(path: MapNode[]): RouteStep[] {
  const steps: RouteStep[] = [];

  for (let i = 0; i < path.length; i++) {
    const current = path[i]!;
    const next = path[i + 1];

    if (i === 0) {
      steps.push({
        instruction: `Start at ${current.label}`,
        distance: 0,
        direction: 'straight',
        landmark: current.label,
      });
      continue;
    }

    if (i === path.length - 1) {
      steps.push({
        instruction: `Arrive at ${current.label}`,
        distance: 0,
        direction: 'arrive',
        landmark: current.label,
      });
      continue;
    }

    if (current.type === 'elevator') {
      steps.push({
        instruction: `Take elevator to Level ${next?.level ?? current.level}`,
        distance: 0,
        direction: 'elevator',
        landmark: current.label,
      });
      continue;
    }

    if (next) {
      const d = distance(current, next);
      const dir = getDirection(path[i - 1], current, next);
      steps.push({
        instruction: getInstruction(dir, next.label, d),
        distance: Math.round(d),
        direction: dir,
        landmark: next.label,
      });
    }
  }

  return steps;
}

function getDirection(
  prev: MapNode | undefined,
  current: MapNode,
  next: MapNode
): RouteStep['direction'] {
  if (!prev) return 'straight';

  const prevDx = current.x - prev.x;
  const prevDy = current.y - prev.y;
  const nextDx = next.x - current.x;
  const nextDy = next.y - current.y;

  const cross = prevDx * nextDy - prevDy * nextDx;

  if (Math.abs(cross) < 1000) return 'straight';
  return cross > 0 ? 'right' : 'left';
}

function getInstruction(dir: RouteStep['direction'], landmark: string, distance: number): string {
  const meters = Math.round(distance * 0.3); // Scale to approximate meters
  switch (dir) {
    case 'left': return `Turn left toward ${landmark} (${meters}m)`;
    case 'right': return `Turn right toward ${landmark} (${meters}m)`;
    case 'elevator': return `Take the elevator`;
    case 'arrive': return `You have arrived at ${landmark}`;
    default: return `Continue straight to ${landmark} (${meters}m)`;
  }
}

function calculateTotalDistance(path: MapNode[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    total += distance(a, b);
  }
  return Math.round(total);
}

// ─── Quick Navigation Helper ───────────────────────────────
export function findNearestAmenity(
  fromId: string,
  amenityType: string,
  nodes: MapNode[] = STADIUM_NODES
): MapNode | null {
  const amenityNodes = nodes.filter(n => n.type === amenityType);
  if (amenityNodes.length === 0) return null;

  const from = nodes.find(n => n.id === fromId);
  if (!from) return null;

  return amenityNodes.reduce((closest, node) => {
    const d1 = heuristic(from, node);
    const d2 = heuristic(from, closest);
    return d1 < d2 ? node : closest;
  });
}
