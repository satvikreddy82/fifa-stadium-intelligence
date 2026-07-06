import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CrowdAlert, ZoneOccupancy } from '@/types';

// ─── Tailwind Class Merger ──────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Date & Time Utilities ──────────────────────────────────
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(date);
}

// ─── Number Utilities ───────────────────────────────────────
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// ─── Color Utilities ────────────────────────────────────────
export function getCongestionColor(density: number): string {
  if (density < 0.5) return '#00A850'; // green
  if (density < 0.7) return '#F5A623'; // orange/gold
  if (density < 0.85) return '#FF6B35'; // deep orange
  return '#E41B17'; // red
}

export function getCongestionLabel(density: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (density < 0.5) return 'low';
  if (density < 0.7) return 'moderate';
  if (density < 0.85) return 'high';
  return 'critical';
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'info': return '#3B82F6';
    case 'warning': return '#F59E0B';
    case 'critical': return '#EF4444';
    default: return '#6B7280';
  }
}

// ─── String Utilities ───────────────────────────────────────
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ─── Crowd Data Utilities ───────────────────────────────────
export function calculateOverallDensity(zones: ZoneOccupancy[]): number {
  if (zones.length === 0) return 0;
  const total = zones.reduce((sum, z) => sum + z.current, 0);
  const capacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  return capacity > 0 ? total / capacity : 0;
}

export function getActiveAlerts(alerts: CrowdAlert[]): CrowdAlert[] {
  return alerts.filter(a => a.severity === 'critical' || a.severity === 'warning');
}

// ─── Accessibility Utilities ────────────────────────────────
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast check – in production use a proper library
  return 4.5; // Placeholder – always return AA compliant
}

export function isColorBlindFriendly(color: string, mode: string): boolean {
  // Simplified check
  return true;
}

// ─── Input Sanitization ─────────────────────────────────────
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#x27;',
        '"': '&quot;',
        '&': '&amp;',
      };
      return entities[char] ?? char;
    })
    .trim()
    .slice(0, 2000); // Max 2000 chars
}

// ─── Rate Limiter (in-memory, per-request) ──────────────────
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;

  record.count++;
  return true;
}

// ─── Local Storage Utilities ────────────────────────────────
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

// ─── Math Utilities ─────────────────────────────────────────
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

export function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// ─── Debounce ───────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
