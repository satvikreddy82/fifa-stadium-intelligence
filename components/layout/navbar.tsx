'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, MapPin, Users, Bus, AlertTriangle, Leaf,
  BarChart3, Heart, Sun, Moon, Globe, Bell,
  Menu, X, ChevronDown, Trophy, Wifi
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { useTheme } from 'next-themes';
import { cn, formatTime } from '@/lib/utils';
import { LANGUAGE_LABELS, type Language } from '@/types';

const NAV_ITEMS = [
  { href: '/stadium',       label: 'Stadium',       icon: <MapPin size={15} />,          shortLabel: 'Map' },
  { href: '/crowd',         label: 'Crowd',         icon: <Users size={15} />,            shortLabel: 'Crowd' },
  { href: '/transport',     label: 'Transport',     icon: <Bus size={15} />,              shortLabel: 'Transit' },
  { href: '/emergency',     label: 'Emergency',     icon: <AlertTriangle size={15} />,    shortLabel: 'SOS' },
  { href: '/sustainability', label: 'Eco',          icon: <Leaf size={15} />,             shortLabel: 'Eco' },
  { href: '/dashboard',     label: 'Dashboard',     icon: <BarChart3 size={15} />,        shortLabel: 'Dash' },
  { href: '/volunteer',     label: 'Volunteer',     icon: <Heart size={15} />,            shortLabel: 'Vol' },
];

const LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'pt', 'ar', 'hi', 'ja', 'zh', 'ko'];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, alerts, toggleAssistant, isAssistantOpen } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [scrolled, setScrolled] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled ? 'glass border-b border-white/10 shadow-glass' : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group" aria-label="FIFA StadiumIQ Home">
              <motion.div
                className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Trophy size={16} className="text-primary-foreground" />
              </motion.div>
              <span className="font-display font-black text-lg hidden sm:block">
                Stadium<span className="text-amber-400">IQ</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 ml-4 flex-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-${item.label.toLowerCase()}`}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Live time */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground glass rounded-lg px-3 py-1.5">
                <Wifi size={11} className="text-green-400" />
                {formatTime(time)}
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button
                  id="lang-selector"
                  onClick={() => setLangOpen(o => !o)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground glass rounded-lg px-3 py-2 transition-colors"
                  aria-label="Select language"
                  aria-expanded={langOpen}
                >
                  <Globe size={14} />
                  <span className="uppercase font-mono font-bold text-xs">{language}</span>
                  <ChevronDown size={12} className={cn('transition-transform', langOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 glass border border-border rounded-xl p-1 w-48 shadow-premium z-50"
                      role="listbox"
                      aria-label="Language options"
                    >
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang}
                          role="option"
                          aria-selected={language === lang}
                          onClick={() => { setLanguage(lang); setLangOpen(false); }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between',
                            language === lang
                              ? 'bg-primary/15 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                          )}
                        >
                          <span>{LANGUAGE_LABELS[lang]}</span>
                          <span className="text-xs font-mono opacity-50 uppercase">{lang}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Alerts */}
              <button
                id="nav-alerts"
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label={`Notifications${unreadAlerts > 0 ? `, ${unreadAlerts} unread` : ''}`}
              >
                <Bell size={16} />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                id="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* AI Assistant */}
              <button
                id="ai-assistant-toggle"
                onClick={toggleAssistant}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105',
                  isAssistantOpen
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                )}
                aria-label={`${isAssistantOpen ? 'Close' : 'Open'} AI assistant`}
                aria-expanded={isAssistantOpen}
              >
                <Brain size={15} />
                <span className="hidden sm:block">AI</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              id="mobile-nav"
              role="dialog"
              aria-label="Mobile navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 glass border-r border-border z-50 lg:hidden pt-20 pb-6 px-4 overflow-y-auto"
            >
              <div className="space-y-1">
                {NAV_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      pathname === item.href
                        ? 'bg-primary/15 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click-away for lang dropdown */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
