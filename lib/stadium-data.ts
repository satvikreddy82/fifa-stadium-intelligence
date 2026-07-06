// ============================================================
// FIFA StadiumIQ 2026 – Stadium Data & Configuration
// ============================================================
import type { Stadium, StadiumZone, Gate, Amenity, MapNode, EmergencyAsset } from '@/types';

// ─── FIFA World Cup 2026 Stadiums ──────────────────────────
export const STADIUMS: Stadium[] = [
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    country: 'USA',
    capacity: 82500,
    lat: 40.8135,
    lng: -74.0745,
    zones: generateZones('metlife'),
    gates: generateGates(),
    amenities: generateAmenities(),
  },
  {
    id: 'att-stadium',
    name: 'AT&T Stadium',
    city: 'Arlington, TX',
    country: 'USA',
    capacity: 80000,
    lat: 32.7473,
    lng: -97.0945,
    zones: generateZones('att'),
    gates: generateGates(),
    amenities: generateAmenities(),
  },
  {
    id: 'sofi-stadium',
    name: 'SoFi Stadium',
    city: 'Inglewood, CA',
    country: 'USA',
    capacity: 70240,
    lat: 33.9535,
    lng: -118.3392,
    zones: generateZones('sofi'),
    gates: generateGates(),
    amenities: generateAmenities(),
  },
  {
    id: 'azteca',
    name: 'Estadio Azteca',
    city: 'Mexico City',
    country: 'Mexico',
    capacity: 87600,
    lat: 19.3029,
    lng: -99.1504,
    zones: generateZones('azteca'),
    gates: generateGates(),
    amenities: generateAmenities(),
  },
  {
    id: 'bc-place',
    name: 'BC Place',
    city: 'Vancouver',
    country: 'Canada',
    capacity: 54500,
    lat: 49.2768,
    lng: -123.1116,
    zones: generateZones('bc'),
    gates: generateGates(),
    amenities: generateAmenities(),
  },
];

export const DEFAULT_STADIUM = STADIUMS[0]!;

// ─── Zone Generator ────────────────────────────────────────
function generateZones(stadiumId: string): StadiumZone[] {
  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const colors = ['#00A850', '#00A850', '#F5A623', '#F5A623', '#FF6B35', '#FF6B35', '#E41B17', '#E41B17'];

  return sections.map((section, i) => ({
    id: `${stadiumId}-zone-${section}`,
    name: `Section ${section}`,
    section,
    capacity: 1500 + Math.floor(Math.random() * 500),
    currentOccupancy: Math.floor((0.45 + Math.random() * 0.5) * (1500 + Math.floor(Math.random() * 500))),
    level: Math.floor(i / 4) + 1,
    isAccessible: i % 3 === 0,
    color: colors[i] ?? '#00A850',
  }));
}

// ─── Gate Generator ────────────────────────────────────────
function generateGates(): Gate[] {
  const positions = [
    { x: 400, y: 50 },  // Gate 1 - North
    { x: 700, y: 250 }, // Gate 2 - NE
    { x: 750, y: 400 }, // Gate 3 - East
    { x: 700, y: 550 }, // Gate 4 - SE
    { x: 400, y: 750 }, // Gate 5 - South
    { x: 100, y: 550 }, // Gate 6 - SW
    { x: 50, y: 400 },  // Gate 7 - West
    { x: 100, y: 250 }, // Gate 8 - NW
  ];

  return positions.map((pos, i) => ({
    id: `gate-${i + 1}`,
    name: `Gate ${i + 1}`,
    number: i + 1,
    isOpen: true,
    queueLength: Math.floor(Math.random() * 80) + 10,
    waitTimeMinutes: Math.floor(Math.random() * 15) + 2,
    isAccessible: i % 2 === 0,
    position: pos,
  }));
}

// ─── Amenity Generator ─────────────────────────────────────
function generateAmenities(): Amenity[] {
  return [
    { id: 'food-1', type: 'food', name: 'Main Food Court', level: 1, position: { x: 400, y: 200 }, isAccessible: true, waitTimeMinutes: 8 },
    { id: 'food-2', type: 'food', name: 'Premium Dining', level: 2, position: { x: 600, y: 400 }, isAccessible: true, waitTimeMinutes: 5 },
    { id: 'food-3', type: 'food', name: 'North Concession', level: 1, position: { x: 400, y: 600 }, isAccessible: false, waitTimeMinutes: 12 },
    { id: 'rest-1', type: 'restroom', name: 'Restrooms - North', level: 1, position: { x: 300, y: 150 }, isAccessible: true },
    { id: 'rest-2', type: 'restroom', name: 'Restrooms - South', level: 1, position: { x: 500, y: 650 }, isAccessible: true },
    { id: 'rest-3', type: 'restroom', name: 'Restrooms - East', level: 2, position: { x: 650, y: 400 }, isAccessible: false },
    { id: 'med-1', type: 'medical', name: 'Medical Station A', level: 1, position: { x: 200, y: 400 }, isAccessible: true },
    { id: 'med-2', type: 'medical', name: 'Medical Station B', level: 2, position: { x: 600, y: 300 }, isAccessible: true },
    { id: 'sec-1', type: 'security', name: 'Security Post 1', level: 1, position: { x: 400, y: 400 }, isAccessible: true },
    { id: 'elev-1', type: 'elevator', name: 'Elevator A', level: 1, position: { x: 200, y: 200 }, isAccessible: true },
    { id: 'elev-2', type: 'elevator', name: 'Elevator B', level: 1, position: { x: 600, y: 600 }, isAccessible: true },
    { id: 'info-1', type: 'information', name: 'Information Desk', level: 1, position: { x: 400, y: 450 }, isAccessible: true },
    { id: 'charge-1', type: 'charging', name: 'Charging Station', level: 2, position: { x: 350, y: 300 }, isAccessible: true },
  ];
}

// ─── Navigation Graph (Indoor Map) ─────────────────────────
export const STADIUM_NODES: MapNode[] = [
  // Main concourse ring
  { id: 'n1', x: 400, y: 100, level: 1, label: 'Gate 1', type: 'gate', isAccessible: true, connections: ['n2', 'n8', 'n9'] },
  { id: 'n2', x: 650, y: 200, level: 1, label: 'Gate 2 Corridor', type: 'corridor', isAccessible: false, connections: ['n1', 'n3'] },
  { id: 'n3', x: 750, y: 400, level: 1, label: 'Gate 3', type: 'gate', isAccessible: true, connections: ['n2', 'n4', 'n10'] },
  { id: 'n4', x: 650, y: 600, level: 1, label: 'Gate 4 Corridor', type: 'corridor', isAccessible: true, connections: ['n3', 'n5'] },
  { id: 'n5', x: 400, y: 700, level: 1, label: 'Gate 5', type: 'gate', isAccessible: true, connections: ['n4', 'n6', 'n11'] },
  { id: 'n6', x: 150, y: 600, level: 1, label: 'Gate 6 Corridor', type: 'corridor', isAccessible: true, connections: ['n5', 'n7'] },
  { id: 'n7', x: 50, y: 400, level: 1, label: 'Gate 7', type: 'gate', isAccessible: false, connections: ['n6', 'n8'] },
  { id: 'n8', x: 150, y: 200, level: 1, label: 'Gate 8 Corridor', type: 'corridor', isAccessible: true, connections: ['n7', 'n1'] },
  // Center corridors
  { id: 'n9', x: 400, y: 250, level: 1, label: 'North Concourse', type: 'corridor', isAccessible: true, connections: ['n1', 'n10', 'n12'] },
  { id: 'n10', x: 600, y: 400, level: 1, label: 'East Concourse', type: 'corridor', isAccessible: true, connections: ['n3', 'n9', 'n11'] },
  { id: 'n11', x: 400, y: 550, level: 1, label: 'South Concourse', type: 'corridor', isAccessible: true, connections: ['n5', 'n10', 'n12'] },
  { id: 'n12', x: 200, y: 400, level: 1, label: 'West Concourse', type: 'corridor', isAccessible: true, connections: ['n9', 'n11', 'n13'] },
  // Amenity nodes
  { id: 'n13', x: 400, y: 400, level: 1, label: 'Central Hub', type: 'corridor', isAccessible: true, connections: ['n9', 'n10', 'n11', 'n12'] },
  // Level 2 via elevators
  { id: 'n14', x: 200, y: 200, level: 2, label: 'Elevator A (L2)', type: 'elevator', isAccessible: true, connections: ['n15', 'n16'] },
  { id: 'n15', x: 600, y: 200, level: 2, label: 'Level 2 North', type: 'corridor', isAccessible: true, connections: ['n14', 'n16'] },
  { id: 'n16', x: 600, y: 600, level: 2, label: 'Elevator B (L2)', type: 'elevator', isAccessible: true, connections: ['n15', 'n14'] },
];

// ─── Emergency Assets ──────────────────────────────────────
export const EMERGENCY_ASSETS: EmergencyAsset[] = [
  { id: 'exit-1', type: 'exit', name: 'Emergency Exit 1', location: 'North - Gate 1', position: { x: 400, y: 80 }, level: 1 },
  { id: 'exit-2', type: 'exit', name: 'Emergency Exit 2', location: 'East - Gate 3', position: { x: 760, y: 400 }, level: 1 },
  { id: 'exit-3', type: 'exit', name: 'Emergency Exit 3', location: 'South - Gate 5', position: { x: 400, y: 720 }, level: 1 },
  { id: 'exit-4', type: 'exit', name: 'Emergency Exit 4', location: 'West - Gate 7', position: { x: 40, y: 400 }, level: 1 },
  { id: 'med-e1', type: 'medical', name: 'First Aid Station A', location: 'West Concourse', position: { x: 200, y: 400 }, level: 1, contactNumber: '+1-800-FIFA-MED' },
  { id: 'med-e2', type: 'medical', name: 'First Aid Station B', location: 'East Concourse L2', position: { x: 600, y: 300 }, level: 2, contactNumber: '+1-800-FIFA-MED' },
  { id: 'sec-e1', type: 'security', name: 'Security Command', location: 'Central Hub', position: { x: 400, y: 400 }, level: 1, contactNumber: '+1-800-FIFA-SEC' },
  { id: 'assm-1', type: 'assembly_point', name: 'Assembly Point A', location: 'North Parking Lot', position: { x: 400, y: 0 }, level: 0 },
  { id: 'aed-1', type: 'defibrillator', name: 'AED Unit 1', location: 'Gate 1 Pillar', position: { x: 380, y: 110 }, level: 1 },
  { id: 'aed-2', type: 'defibrillator', name: 'AED Unit 2', location: 'Gate 5 Pillar', position: { x: 380, y: 690 }, level: 1 },
];

// ─── Static FIFA Match Data ────────────────────────────────
export const UPCOMING_MATCHES = [
  { id: 'm1', home: 'Brazil', away: 'France', time: '18:00', date: '2026-07-12', stadium: 'MetLife Stadium', group: 'A' },
  { id: 'm2', home: 'Argentina', away: 'Germany', time: '15:00', date: '2026-07-12', stadium: 'AT&T Stadium', group: 'B' },
  { id: 'm3', home: 'Spain', away: 'England', time: '21:00', date: '2026-07-13', stadium: 'SoFi Stadium', group: 'C' },
  { id: 'm4', home: 'USA', away: 'Mexico', time: '18:00', date: '2026-07-14', stadium: 'MetLife Stadium', group: 'D' },
  { id: 'm5', home: 'Portugal', away: 'Netherlands', time: '15:00', date: '2026-07-15', stadium: 'BC Place', group: 'E' },
];
