'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import {
  Brain, MapPin, Users, Zap, Shield, Leaf, Globe, AlertTriangle,
  ChevronRight, Play, Star, Trophy, ArrowRight, Mic, Navigation,
  BarChart3, Heart, Bus, Wifi, Volume2, Award
} from 'lucide-react';
import { UPCOMING_MATCHES } from '@/lib/stadium-data';
import { cn } from '@/lib/utils';

// ─── Particle Background ───────────────────────────────────
function ParticleField() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-400"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -30, 0], x: [0, 10, -10, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,61,165,0.15) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
}

// ─── Animated Counter ──────────────────────────────────────
function Counter({ target, label, suffix = '' }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          let start = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold gradient-text-gold font-display">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

// ─── Feature Card ──────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, href, color, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href} className="block group h-full" aria-label={`Go to ${title}`}>
        <div className="relative h-full glass rounded-2xl p-6 border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-premium cursor-pointer">
          {/* Gradient hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `radial-gradient(circle at 30% 30%, ${color}18 0%, transparent 70%)` }}
          />

          <div className="relative z-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${color}20`, border: `1px solid ${color}40` }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-foreground group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            <div className="flex items-center gap-1 mt-4 text-xs font-medium" style={{ color }}>
              Explore <ChevronRight size={12} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Match Ticker ──────────────────────────────────────────
function MatchTicker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % UPCOMING_MATCHES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const match = UPCOMING_MATCHES[current]!;

  return (
    <div className="glass rounded-xl px-6 py-3 flex items-center gap-4 text-sm overflow-hidden">
      <div className="flex items-center gap-2 text-amber-400 font-semibold shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
        LIVE
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 min-w-0"
        >
          <span className="font-semibold text-foreground">{match.home}</span>
          <span className="text-muted-foreground font-bold">vs</span>
          <span className="font-semibold text-foreground">{match.away}</span>
          <span className="text-muted-foreground hidden sm:block">•</span>
          <span className="text-muted-foreground hidden sm:block truncate">{match.stadium}</span>
          <span className="text-amber-400 font-semibold shrink-0">{match.time}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Features Data ─────────────────────────────────────────
const FEATURES = [
  {
    icon: <Brain size={20} />,
    title: 'AI Stadium Assistant',
    description: 'Conversational AI powered by Gemini. Ask anything — seats, food, restrooms, parking — in 10 languages.',
    href: '/stadium',
    color: '#60a5fa',
  },
  {
    icon: <Navigation size={20} />,
    title: 'Indoor Navigation',
    description: 'Interactive A*-powered pathfinding with wheelchair-accessible routes, elevator routing, and animated guidance.',
    href: '/stadium',
    color: '#a78bfa',
  },
  {
    icon: <Users size={20} />,
    title: 'Crowd Intelligence',
    description: 'Live animated heatmaps, congestion prediction, queue times, and AI-generated alternate route suggestions.',
    href: '/crowd',
    color: '#f59e0b',
  },
  {
    icon: <Bus size={20} />,
    title: 'Transportation Hub',
    description: 'Metro, bus, parking, and ride-share coordination. AI-recommended routes with real-time availability.',
    href: '/transport',
    color: '#34d399',
  },
  {
    icon: <AlertTriangle size={20} />,
    title: 'Emergency Response',
    description: 'SOS button, nearest exit routing, AI evacuation instructions, medical station locator.',
    href: '/emergency',
    color: '#f87171',
  },
  {
    icon: <Leaf size={20} />,
    title: 'Sustainability Dashboard',
    description: 'Carbon, energy, water, and waste monitoring with AI eco-score and green transport recommendations.',
    href: '/sustainability',
    color: '#4ade80',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Organizer Dashboard',
    description: 'Real-time stadium-wide operations view with KPI cards, alerts, AI insights, and predictive analytics.',
    href: '/dashboard',
    color: '#fb923c',
  },
  {
    icon: <Heart size={20} />,
    title: 'Volunteer Copilot',
    description: 'AI-generated task assignments, incident reports, FAQ answering, and gamified volunteer leaderboard.',
    href: '/volunteer',
    color: '#e879f9',
  },
  {
    icon: <Globe size={20} />,
    title: 'Multilingual AI',
    description: 'Instant translation via Gemini in English, Spanish, French, Arabic, Hindi, Japanese, Chinese, and more.',
    href: '/stadium',
    color: '#22d3ee',
  },
];

const AI_HIGHLIGHTS = [
  { icon: <Mic size={16} />, label: 'Voice Input' },
  { icon: <Volume2 size={16} />, label: 'Speech Output' },
  { icon: <Wifi size={16} />, label: 'Real-time AI' },
  { icon: <Shield size={16} />, label: 'OWASP Secure' },
  { icon: <Award size={16} />, label: 'WCAG AA' },
  { icon: <Zap size={16} />, label: 'Gemini 1.5 Flash' },
];

// ─── Main Page ─────────────────────────────────────────────
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── Hero Section ── */}
      <section
        ref={heroRef}
        id="hero"
        className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden pt-16"
        aria-label="Hero section"
      >
        <ParticleField />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto px-6 py-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-amber-400 border border-amber-400/20 mb-8"
          >
            <Trophy size={14} />
            FIFA World Cup 2026 · Hackathon Submission
            <Star size={14} className="fill-amber-400" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black leading-[0.9] mb-6"
          >
            <span className="text-white">Stadium</span>
            <br />
            <span className="gradient-text">Intelligence</span>
            <br />
            <span className="text-white text-4xl sm:text-5xl md:text-6xl">for the World Cup</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Generative AI-powered platform transforming the FIFA World Cup 2026 experience.
            Smart navigation, crowd management, real-time operations — all running on{' '}
            <span className="text-amber-400 font-semibold">100% free services</span>.
          </motion.p>

          {/* Match Ticker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-10 max-w-xl mx-auto"
          >
            <MatchTicker />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/stadium"
              id="cta-explore"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-8 py-4 font-semibold text-base hover:opacity-90 transition-all duration-200 hover:scale-105 hover:shadow-glow-blue"
            >
              <Brain size={18} />
              Explore StadiumIQ
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              id="cta-dashboard"
              className="inline-flex items-center gap-2 glass border border-white/20 rounded-xl px-8 py-4 font-semibold text-base text-white hover:border-white/40 transition-all duration-200 hover:scale-105"
            >
              <Play size={16} className="fill-white" />
              Live Dashboard
            </Link>
          </motion.div>

          {/* AI Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-3 justify-center mt-12"
          >
            {AI_HIGHLIGHTS.map(h => (
              <span
                key={h.label}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground glass rounded-full px-3 py-1.5 border border-white/5"
              >
                {h.icon}
                {h.label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-center justify-center">
            <div className="w-1 h-3 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 bg-card/50 border-y border-border" aria-label="Stadium statistics">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter target={16} label="Host Cities" suffix="+" />
            <Counter target={48} label="Teams" />
            <Counter target={104} label="Matches" />
            <Counter target={3} label="Countries" />
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 container" aria-label="Platform features">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            AI-Powered Features
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
            Everything a Stadium Needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nine interconnected AI systems working in real-time to create the ultimate FIFA World Cup 2026 experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.href + f.title} {...f} delay={i * 0.07} />
          ))}
        </div>
      </section>

      {/* ── Technology Section ── */}
      <section className="py-24 bg-card/30 border-y border-border" aria-label="Technology stack">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-black mb-4">
              Built with 100% Free Services
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Zero cost. Maximum capability. Every service used is free-tier compatible and production-ready.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: 'Next.js 14', desc: 'Framework', color: '#fff' },
              { name: 'Gemini AI', desc: 'Generative AI', color: '#60a5fa' },
              { name: 'Supabase', desc: 'Database', color: '#34d399' },
              { name: 'OpenStreetMap', desc: 'Maps', color: '#f59e0b' },
              { name: 'Vercel', desc: 'Deployment', color: '#a78bfa' },
              { name: 'TypeScript', desc: 'Language', color: '#22d3ee' },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-4 text-center border border-white/5 hover:border-white/15 transition-colors"
              >
                <div className="text-xs font-bold mb-1" style={{ color: tech.color }}>{tech.name}</div>
                <div className="text-xs text-muted-foreground">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 container text-center" aria-label="Call to action">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass rounded-3xl p-12 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 gradient-hero opacity-50" />
            <div className="relative z-10">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-display font-black mb-4">
                Ready to Experience StadiumIQ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Click the floating ⚽ button to chat with the AI, or explore any feature module.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/stadium"
                  className="inline-flex items-center gap-2 bg-amber-500 text-black rounded-xl px-8 py-4 font-bold hover:bg-amber-400 transition-all hover:scale-105"
                >
                  <MapPin size={18} />
                  Stadium Navigator
                </Link>
                <Link
                  href="/crowd"
                  className="inline-flex items-center gap-2 glass border border-white/20 rounded-xl px-8 py-4 font-semibold text-white hover:border-white/40 transition-all hover:scale-105"
                >
                  <Users size={18} />
                  Crowd Intelligence
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10 bg-card/30" role="contentinfo">
        <div className="container text-center">
          <p className="text-muted-foreground text-sm">
            ⚽ <span className="font-semibold text-foreground">FIFA StadiumIQ 2026</span> — Built for the FIFA World Cup 2026 GenAI Hackathon.
            Running 100% on free services. Powered by Google Gemini.
          </p>
          <p className="text-muted-foreground/50 text-xs mt-2">
            Next.js · TypeScript · Tailwind CSS · Gemini AI · Supabase · OpenStreetMap · Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
