'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Heart, Brain, Send, Trophy, Star, CheckCircle, Clock, Loader2, ChevronRight, Award } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { cn, generateId, sanitizeInput } from '@/lib/utils';

const TASKS = [
  { id: '1', title: 'Gate 3 Crowd Management', zone: 'Gate 3', priority: 'urgent' as const, status: 'pending' as const, points: 50, description: '45 fans waiting for guidance near Gate 3. Direct to Section B.' },
  { id: '2', title: 'Accessibility Escort - Row A1', zone: 'Section A', priority: 'high' as const, status: 'in_progress' as const, points: 30, description: 'Escort wheelchair user from Gate 6 to accessible seating in Section A1.' },
  { id: '3', title: 'Lost & Found Report', zone: 'Info Desk', priority: 'medium' as const, status: 'pending' as const, points: 20, description: 'Fan reported lost backpack near food court. Check lost & found bin.' },
  { id: '4', title: 'Food Court Queue Update', zone: 'Concession B', priority: 'low' as const, status: 'completed' as const, points: 15, description: 'Update digital signage with current queue times for all food courts.' },
  { id: '5', title: 'First Aid Station Resupply', zone: 'Medical A', priority: 'high' as const, status: 'pending' as const, points: 40, description: 'Ice packs running low at First Aid Station A. Collect from storage room B3.' },
];

const VOLUNTEERS_LEADERBOARD = [
  { name: 'Sarah K.', points: 1240, badge: 'legend', tasks: 48, avatar: '👩' },
  { name: 'Miguel R.', points: 980, badge: 'champion', tasks: 39, avatar: '👨' },
  { name: 'Priya S.', points: 750, badge: 'expert', tasks: 30, avatar: '👩' },
  { name: 'James L.', points: 520, badge: 'helper', tasks: 21, avatar: '👨' },
  { name: 'You', points: 310, badge: 'helper', tasks: 13, avatar: '⭐', isCurrentUser: true },
];

const BADGE_ICONS: Record<string, string> = {
  newcomer: '🌱', helper: '⭐', expert: '🏅', champion: '🏆', legend: '💎',
};

export default function VolunteerPage() {
  const { language } = useAppStore();
  const [tasks, setTasks] = useState(TASKS);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'copilot' | 'leaderboard'>('tasks');

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' as const } as any : t));
    setCompletedTaskId(id);
    setTimeout(() => setCompletedTaskId(null), 2000);
  };

  const askCopilot = async () => {
    if (!copilotQuery.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: sanitizeInput(copilotQuery),
          context: 'FIFA World Cup 2026 Stadium Volunteer at MetLife Stadium',
          language,
        }),
      });
      const data = await res.json() as { response: string };
      setCopilotResponse(data.response);
    } catch {
      setCopilotResponse('👋 I\'m here to help! I can assist with task assignments, incident reporting, fan FAQs, and emergency protocols. What do you need?');
    } finally {
      setIsLoading(false);
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 container py-8 max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={20} className="text-pink-400" />
            <h1 className="font-display font-bold text-2xl">Volunteer Copilot</h1>
          </div>
          <p className="text-muted-foreground">AI-powered task management, incident reporting, and volunteer support</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', value: pendingCount, color: '#f59e0b' },
            { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#60a5fa' },
            { label: 'Completed', value: completedCount, color: '#4ade80' },
          ].map(stat => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 text-center border border-white/5">
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([['tasks', 'My Tasks'], ['copilot', 'AI Copilot'], ['leaderboard', 'Leaderboard']] as const).map(([id, label]) => (
            <button
              key={id}
              id={`vol-tab-${id}`}
              onClick={() => setActiveTab(id)}
              role="tab"
              aria-selected={activeTab === id}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeTab === id ? 'bg-primary text-primary-foreground' : 'glass border border-white/10 text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tasks Panel */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  'glass rounded-xl p-4 border transition-all',
                  task.status === 'completed' ? 'border-green-500/20 opacity-60' :
                  task.priority === 'urgent' ? 'border-red-500/30' :
                  task.priority === 'high' ? 'border-amber-500/20' : 'border-white/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-2.5 h-2.5 rounded-full mt-1.5 shrink-0',
                    task.status === 'completed' ? 'bg-green-400' :
                    task.priority === 'urgent' ? 'bg-red-400 animate-pulse' :
                    task.priority === 'high' ? 'bg-amber-400' :
                    task.priority === 'medium' ? 'bg-blue-400' : 'bg-muted-foreground'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{task.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400 font-semibold">+{task.points} pts</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                          task.priority === 'urgent' ? 'badge-critical' :
                          task.priority === 'high' ? 'badge-high' :
                          task.priority === 'medium' ? 'badge-moderate' : 'badge-low'
                        )}>{task.priority}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">📍 {task.zone}</span>
                      {task.status !== 'completed' ? (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-medium"
                        >
                          {completedTaskId === task.id ? <CheckCircle size={12} /> : <ChevronRight size={12} />}
                          {completedTaskId === task.id ? 'Done!' : 'Mark Complete'}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle size={12} /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Copilot Panel */}
        {activeTab === 'copilot' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <Brain size={18} className="text-primary" />
              <h2 className="font-semibold">AI Volunteer Copilot</h2>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {['How do I report an incident?', 'What should I do at Gate 3?', 'Fan asking about wheelchair access', 'Need help with task assignment'].map(q => (
                <button key={q} onClick={() => setCopilotQuery(q)}
                  className="text-left p-3 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all text-xs text-muted-foreground hover:text-foreground">
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={copilotQuery}
                onChange={e => setCopilotQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void askCopilot(); }}
                placeholder="Ask the AI copilot anything..."
                className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                aria-label="Ask volunteer copilot"
              />
              <button
                onClick={() => void askCopilot()}
                disabled={!copilotQuery || isLoading}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>

            <AnimatePresence>
              {copilotResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap"
                >
                  {copilotResponse}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <Trophy size={18} className="text-amber-400" />
                <h2 className="font-semibold">Volunteer Leaderboard</h2>
              </div>
              <div className="space-y-3">
                {VOLUNTEERS_LEADERBOARD.map((vol, i) => (
                  <motion.div
                    key={vol.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border transition-all',
                      vol.isCurrentUser ? 'bg-primary/10 border-primary/30' : 'bg-secondary/50 border-border'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-black',
                      i === 0 ? 'bg-amber-400 text-black' :
                      i === 1 ? 'bg-zinc-300 text-black' :
                      i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                    )}>
                      {i + 1}
                    </div>
                    <div className="text-2xl">{vol.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {vol.name}
                        {vol.isCurrentUser && <span className="text-xs text-primary">(You)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{vol.tasks} tasks · {BADGE_ICONS[vol.badge]} {vol.badge}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-400">{vol.points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
