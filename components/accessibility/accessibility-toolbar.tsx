'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility, Eye, Type, Palette, Keyboard, Volume2, ZapOff, ChevronUp, ChevronDown, X
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';

type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export function AccessibilityToolbar() {
  const { accessibility, setAccessibility } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (key: keyof typeof accessibility, value?: unknown) => {
    setAccessibility({ [key]: value !== undefined ? value : !accessibility[key] });
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="accessibility-panel"
            role="dialog"
            aria-label="Accessibility settings"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-3 glass border border-white/10 rounded-2xl p-4 w-64 shadow-premium"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Accessibility</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Close accessibility panel"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {/* High Contrast */}
              <ToggleRow
                icon={<Eye size={14} />}
                label="High Contrast"
                checked={accessibility.highContrast}
                onChange={() => toggle('highContrast')}
                id="a11y-high-contrast"
              />

              {/* Large Text */}
              <ToggleRow
                icon={<Type size={14} />}
                label="Large Text"
                checked={accessibility.largeText}
                onChange={() => toggle('largeText')}
                id="a11y-large-text"
              />

              {/* Reduced Motion */}
              <ToggleRow
                icon={<ZapOff size={14} />}
                label="Reduce Motion"
                checked={accessibility.reducedMotion}
                onChange={() => toggle('reducedMotion')}
                id="a11y-reduce-motion"
              />

              {/* Screen Reader */}
              <ToggleRow
                icon={<Volume2 size={14} />}
                label="Screen Reader Mode"
                checked={accessibility.screenReader}
                onChange={() => toggle('screenReader')}
                id="a11y-screen-reader"
              />

              {/* Keyboard Navigation */}
              <ToggleRow
                icon={<Keyboard size={14} />}
                label="Keyboard Navigation"
                checked={accessibility.keyboardNavigation}
                onChange={() => toggle('keyboardNavigation')}
                id="a11y-keyboard-nav"
              />

              {/* Color Blind Mode */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Palette size={14} />
                  <label htmlFor="a11y-color-blind" className="text-sm font-medium text-foreground">Color Vision</label>
                </div>
                <select
                  id="a11y-color-blind"
                  value={accessibility.colorBlindMode}
                  onChange={e => toggle('colorBlindMode', e.target.value as ColorBlindMode)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  aria-label="Select color blind mode"
                >
                  <option value="none">Normal Vision</option>
                  <option value="protanopia">Protanopia (Red-blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-blind)</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/60 mt-4">
              Settings are saved automatically and persist across sessions.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        id="accessibility-toggle"
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-11 h-11 rounded-full glass border border-white/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/40 transition-all shadow-glass"
        aria-label={isOpen ? 'Close accessibility panel' : 'Open accessibility settings'}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility size={16} />
      </motion.button>
    </div>
  );
}

function ToggleRow({
  icon, label, checked, onChange, id,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: () => void;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">{label}</label>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          'relative w-10 h-6 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          checked ? 'bg-primary' : 'bg-muted'
        )}
        aria-label={label}
      >
        <span
          className={cn(
            'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300',
            checked ? 'left-5' : 'left-1'
          )}
        />
      </button>
    </div>
  );
}
