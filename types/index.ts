// ============================================================
// FIFA StadiumIQ 2026 – TypeScript Type Definitions
// ============================================================

// ─── User & Auth ───────────────────────────────────────────
export type UserRole = 'fan' | 'organizer' | 'volunteer' | 'security' | 'staff' | 'transport';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  language: Language;
  accessibilityMode: boolean;
}

// ─── Language ──────────────────────────────────────────────
export type Language =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'ar'
  | 'hi'
  | 'ja'
  | 'zh'
  | 'ko';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ar: 'العربية',
  hi: 'हिन्दी',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
};

// ─── Stadium ───────────────────────────────────────────────
export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  lat: number;
  lng: number;
  zones: StadiumZone[];
  gates: Gate[];
  amenities: Amenity[];
}

export interface StadiumZone {
  id: string;
  name: string;
  section: string;
  capacity: number;
  currentOccupancy: number;
  level: number;
  isAccessible: boolean;
  color: string;
}

export interface Gate {
  id: string;
  name: string;
  number: number;
  isOpen: boolean;
  queueLength: number;
  waitTimeMinutes: number;
  isAccessible: boolean;
  position: { x: number; y: number };
}

export interface Amenity {
  id: string;
  type: AmenityType;
  name: string;
  level: number;
  position: { x: number; y: number };
  isAccessible: boolean;
  waitTimeMinutes?: number;
}

export type AmenityType =
  | 'restroom'
  | 'food'
  | 'medical'
  | 'security'
  | 'elevator'
  | 'parking'
  | 'exit'
  | 'information'
  | 'first_aid'
  | 'charging';

// ─── Navigation ────────────────────────────────────────────
export interface NavigationRoute {
  id: string;
  from: MapNode;
  to: MapNode;
  steps: RouteStep[];
  totalDistance: number;
  estimatedTimeMinutes: number;
  isAccessible: boolean;
  hasElevator: boolean;
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  level: number;
  label: string;
  type: 'corridor' | 'gate' | 'amenity' | 'seat' | 'elevator' | 'stairs';
  isAccessible: boolean;
  connections: string[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  direction: 'straight' | 'left' | 'right' | 'elevator' | 'stairs' | 'arrive';
  landmark?: string;
}

// ─── Crowd Intelligence ────────────────────────────────────
export interface CrowdData {
  timestamp: Date;
  zones: ZoneOccupancy[];
  totalOccupancy: number;
  totalCapacity: number;
  congestionLevel: 'low' | 'moderate' | 'high' | 'critical';
  alerts: CrowdAlert[];
}

export interface ZoneOccupancy {
  zoneId: string;
  zoneName: string;
  current: number;
  capacity: number;
  density: number; // 0-1
  trend: 'increasing' | 'stable' | 'decreasing';
  congestionLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface CrowdAlert {
  id: string;
  type: 'congestion' | 'overflow' | 'incident' | 'weather' | 'emergency';
  message: string;
  zone: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

// ─── AI Chat ───────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  language?: Language;
  metadata?: {
    category?: string;
    confidence?: number;
    sources?: string[];
  };
}

export interface AIResponse {
  content: string;
  language: Language;
  suggestedActions?: SuggestedAction[];
  navigationRoute?: NavigationRoute;
  crowdData?: Partial<CrowdData>;
}

export interface SuggestedAction {
  label: string;
  action: string;
  icon?: string;
}

// ─── Transportation ────────────────────────────────────────
export interface TransportOption {
  id: string;
  type: 'walk' | 'metro' | 'bus' | 'parking' | 'rideshare';
  name: string;
  duration: number;
  distance: string;
  availability: 'available' | 'limited' | 'full';
  instructions: string[];
  ecoScore: number;
}

export interface ParkingZone {
  id: string;
  name: string;
  total: number;
  available: number;
  walkTimeMinutes: number;
  isAccessible: boolean;
  level: string;
}

// ─── Emergency ─────────────────────────────────────────────
export interface EmergencyAsset {
  id: string;
  type: 'exit' | 'medical' | 'security' | 'assembly_point' | 'fire_extinguisher' | 'defibrillator';
  name: string;
  location: string;
  position: { x: number; y: number };
  level: number;
  contactNumber?: string;
}

export interface EvacuationRoute {
  id: string;
  fromZone: string;
  steps: string[];
  assemblyPoint: string;
  estimatedTimeMinutes: number;
  isAccessible: boolean;
}

export interface IncidentReport {
  id: string;
  type: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  reportedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  aiSummary?: string;
}

// ─── Sustainability ────────────────────────────────────────
export interface SustainabilityMetrics {
  carbonEmissions: number; // kg CO2
  energyConsumption: number; // kWh
  waterConsumption: number; // liters
  wasteGenerated: number; // kg
  recyclingRate: number; // %
  renewableEnergyShare: number; // %
  ecoScore: number; // 0-100
  timestamp: Date;
}

export interface SustainabilityGoal {
  metric: string;
  current: number;
  target: number;
  unit: string;
  progress: number; // %
}

// ─── Volunteer ─────────────────────────────────────────────
export interface Volunteer {
  id: string;
  name: string;
  zone: string;
  tasks: VolunteerTask[];
  pointsEarned: number;
  badge: VolunteerBadge;
  isOnline: boolean;
  shiftStart: Date;
  shiftEnd: Date;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  zone: string;
  assignedAt: Date;
  completedAt?: Date;
  points: number;
}

export type VolunteerBadge =
  | 'newcomer'
  | 'helper'
  | 'expert'
  | 'champion'
  | 'legend';

// ─── Dashboard ─────────────────────────────────────────────
export interface DashboardKPI {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon: string;
  color: string;
}

export interface SystemAlert {
  id: string;
  type: 'crowd' | 'transport' | 'emergency' | 'sustainability' | 'volunteer' | 'system';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

// ─── Accessibility ─────────────────────────────────────────
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReader: boolean;
  voiceInput: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
}

// ─── Weather ───────────────────────────────────────────────
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  uvIndex: number;
}

// ─── API Responses ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}
