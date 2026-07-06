'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { AlertTriangle, Phone, MapPin, ShieldCheck, Heart, ArrowRight, Loader2, X, Siren } from 'lucide-react';
import { EMERGENCY_ASSETS } from '@/lib/stadium-data';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';

const EMERGENCY_CONTACTS = [
  { label: 'Emergency Services', number: '911', icon: <Phone size={16} />, color: '#ef4444' },
  { label: 'Stadium Security', number: '+1-800-FIFA-SEC', icon: <ShieldCheck size={16} />, color: '#f59e0b' },
  { label: 'Medical Station', number: '+1-800-FIFA-MED', icon: <Heart size={16} />, color: '#ec4899' },
  { label: 'Fire Department', number: '+1-800-FIRE-DC', icon: <Siren size={16} />, color: '#f97316' },
];

const EMERGENCY_TYPES = [
  { id: 'fire', label: '🔥 Fire', color: '#ef4444' },
  { id: 'medical', label: '🚑 Medical', color: '#ec4899' },
  { id: 'crowd', label: '👥 Crowd Crush', color: '#f97316' },
  { id: 'security', label: '🔐 Security', color: '#f59e0b' },
  { id: 'weather', label: '⛈️ Weather', color: '#60a5fa' },
  { id: 'evacuation', label: '🚪 Evacuation', color: '#a78bfa' },
];

export default function EmergencyPage() {
  const { language, addAlert } = useAppStore();
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(3);
  const [emergencyType, setEmergencyType] = useState('');
  const [location, setLocation] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sosConfirmed, setSosConfirmed] = useState(false);

  // SOS countdown
  useEffect(() => {
    if (!sosActive || sosConfirmed) return;
    if (sosCountdown === 0) {
      setSosConfirmed(true);
      addAlert({ type: 'emergency', message: '🚨 SOS signal sent to stadium security!', severity: 'critical' });
      return;
    }
    const t = setTimeout(() => setSosCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [sosActive, sosCountdown, sosConfirmed]);

  const cancelSOS = () => {
    setSosActive(false);
    setSosCountdown(3);
    setSosConfirmed(false);
  };

  const getInstructions = async () => {
    if (!emergencyType) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: emergencyType, location: location || 'Stadium', language }),
      });
      const data = await res.json() as { instructions: string };
      setInstructions(data.instructions);
    } catch {
      setInstructions('Move calmly to the nearest emergency exit (marked with green EXIT signs). Follow stadium staff instructions. Proceed to Assembly Point A in the North Parking Lot. Call 911 for medical emergencies.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 container py-8 max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={20} className="text-red-400" />
            <h1 className="font-display font-bold text-2xl">Emergency Response</h1>
          </div>
          <p className="text-muted-foreground">AI-powered emergency assistance, evacuation routes, and real-time guidance</p>
        </motion.div>

        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="glass rounded-2xl p-8 border border-red-500/20 text-center">
            <h2 className="font-semibold text-lg mb-2">Emergency SOS</h2>
            <p className="text-muted-foreground text-sm mb-6">Press and hold to alert stadium security. Cancel anytime.</p>

            {!sosActive && !sosConfirmed && (
              <motion.button
                id="sos-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSosActive(true)}
                className="relative w-32 h-32 rounded-full bg-red-600 text-white font-black text-xl mx-auto flex items-center justify-center shadow-2xl hover:bg-red-500 transition-colors"
                aria-label="Activate SOS emergency alert"
              >
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40" />
                <span className="absolute inset-2 rounded-full bg-red-600/50 border border-red-400/30" />
                <span className="relative">SOS</span>
              </motion.button>
            )}

            {sosActive && !sosConfirmed && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
                  <div className="relative text-4xl font-black text-white">{sosCountdown}</div>
                </div>
                <p className="text-red-400 font-semibold animate-pulse">Sending SOS in {sosCountdown}s...</p>
                <button onClick={cancelSOS} className="flex items-center gap-2 glass border border-white/20 rounded-xl px-6 py-2 text-sm hover:border-white/40 transition-all">
                  <X size={14} /> Cancel
                </button>
              </div>
            )}

            {sosConfirmed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                  <ShieldCheck size={40} className="text-red-400" />
                </div>
                <p className="text-red-400 font-bold text-lg">SOS Sent!</p>
                <p className="text-muted-foreground text-sm">Stadium security has been alerted. Help is on the way.</p>
                <button onClick={cancelSOS} className="text-sm text-muted-foreground underline">Reset</button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="font-semibold mb-3">Emergency Contacts</h2>
          <div className="grid grid-cols-2 gap-3">
            {EMERGENCY_CONTACTS.map(contact => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex items-center gap-3 glass rounded-xl p-4 border border-white/5 hover:border-white/20 transition-all group"
                aria-label={`Call ${contact.label}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${contact.color}20`, border: `1px solid ${contact.color}40` }}>
                  <span style={{ color: contact.color }}>{contact.icon}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">{contact.label}</div>
                  <div className="text-xs font-mono text-muted-foreground">{contact.number}</div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* AI Evacuation Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 glass rounded-2xl p-6 border border-white/5"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🤖</span> AI Evacuation Guide
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {EMERGENCY_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setEmergencyType(type.id)}
                className={cn(
                  'p-3 rounded-xl text-sm font-medium border transition-all',
                  emergencyType === type.id
                    ? 'border-primary/50 bg-primary/10 text-foreground'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:border-white/20'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Your current location (e.g., Section A, Gate 3)..."
              className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              aria-label="Your current location"
            />
            <button
              id="get-evacuation-instructions"
              onClick={() => void getInstructions()}
              disabled={!emergencyType || isLoading}
              className="flex items-center gap-2 bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-red-500 disabled:opacity-50 transition-all"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              Guide Me
            </button>
          </div>
          {instructions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed"
            >
              {instructions}
            </motion.div>
          )}
        </motion.div>

        {/* Emergency Assets Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-green-400" /> Emergency Asset Locations
          </h2>
          <div className="space-y-2">
            {EMERGENCY_ASSETS.map(asset => (
              <div key={asset.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                  asset.type === 'exit' ? 'bg-green-500/20 text-green-400' :
                  asset.type === 'medical' ? 'bg-pink-500/20 text-pink-400' :
                  asset.type === 'defibrillator' ? 'bg-red-500/20 text-red-400' :
                  asset.type === 'assembly_point' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-amber-500/20 text-amber-400'
                )}>
                  {asset.type === 'exit' ? '🚪' :
                   asset.type === 'medical' ? '🏥' :
                   asset.type === 'defibrillator' ? '❤️' :
                   asset.type === 'assembly_point' ? '📍' : '🔐'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{asset.name}</div>
                  <div className="text-xs text-muted-foreground">{asset.location}</div>
                </div>
                {asset.contactNumber && (
                  <a href={`tel:${asset.contactNumber}`} className="text-xs text-primary font-mono hover:underline">
                    {asset.contactNumber}
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
