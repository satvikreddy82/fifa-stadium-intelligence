// ============================================================
// FIFA StadiumIQ 2026 – Global App Store (Zustand)
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, AccessibilitySettings, SystemAlert, UserRole } from '@/types';
import { generateId } from '@/lib/utils';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // User Role (for demo switching)
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Accessibility
  accessibility: AccessibilitySettings;
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void;

  // Selected Stadium
  selectedStadiumId: string;
  setSelectedStadiumId: (id: string) => void;

  // AI Assistant
  isAssistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  toggleAssistant: () => void;

  // System Alerts
  alerts: SystemAlert[];
  addAlert: (alert: Omit<SystemAlert, 'id' | 'timestamp' | 'isRead'>) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
  unreadCount: () => number;

  // Sidebar
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Notifications
  hasNewNotification: boolean;
  setHasNewNotification: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),

      // User Role
      userRole: 'fan',
      setUserRole: (userRole) => set({ userRole }),

      // Accessibility
      accessibility: {
        highContrast: false,
        largeText: false,
        colorBlindMode: 'none',
        screenReader: false,
        voiceInput: false,
        keyboardNavigation: false,
        reducedMotion: false,
      },
      setAccessibility: (settings) =>
        set(s => ({ accessibility: { ...s.accessibility, ...settings } })),

      // Stadium
      selectedStadiumId: 'metlife',
      setSelectedStadiumId: (id) => set({ selectedStadiumId: id }),

      // AI Assistant
      isAssistantOpen: false,
      setAssistantOpen: (open) => set({ isAssistantOpen: open }),
      toggleAssistant: () => set(s => ({ isAssistantOpen: !s.isAssistantOpen })),

      // Alerts
      alerts: [],
      addAlert: (alert) =>
        set(s => ({
          alerts: [
            { ...alert, id: generateId(), timestamp: new Date(), isRead: false },
            ...s.alerts.slice(0, 49), // Keep last 50
          ],
          hasNewNotification: true,
        })),
      markAlertRead: (id) =>
        set(s => ({
          alerts: s.alerts.map(a => (a.id === id ? { ...a, isRead: true } : a)),
        })),
      clearAlerts: () => set({ alerts: [] }),
      unreadCount: () => get().alerts.filter(a => !a.isRead).length,

      // Sidebar
      isSidebarOpen: true,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),

      // Notifications
      hasNewNotification: false,
      setHasNewNotification: (val) => set({ hasNewNotification: val }),
    }),
    {
      name: 'fifa-stadiumiq-app',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        userRole: state.userRole,
        accessibility: state.accessibility,
        selectedStadiumId: state.selectedStadiumId,
      }),
    }
  )
);
