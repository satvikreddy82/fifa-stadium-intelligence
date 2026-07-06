'use client';

import { useEffect, useState, useMemo } from 'react';
import type { MapContainer as MapContainerType } from 'react-leaflet';
import type { Stadium, NavigationRoute, MapNode, EmergencyAsset } from '@/types';
import { getCongestionColor } from '@/lib/utils';
import { useCrowdStore } from '@/store/use-crowd-store';

interface StadiumMapProps {
  stadium: Stadium;
  route: NavigationRoute | null;
  currentStep: number;
  nodes: MapNode[];
  emergencyAssets: EmergencyAsset[];
}

export default function StadiumMapView({ stadium, route, currentStep, nodes, emergencyAssets }: StadiumMapProps) {
  const [isClient, setIsClient] = useState(false);
  const { crowdData, startAutoRefresh, stopAutoRefresh } = useCrowdStore();

  useEffect(() => {
    setIsClient(true);
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, []);

  if (!isClient) return null;

  // Render an SVG-based indoor map (works without real GPS coords)
  return (
    <div className="relative w-full h-full bg-[#0a0f1a] overflow-hidden" role="img" aria-label="Interactive stadium map">
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1525 100%)' }}
      >
        {/* Stadium outer shell */}
        <ellipse cx="400" cy="400" rx="350" ry="320" fill="none" stroke="#1e3a5f" strokeWidth="3" />
        <ellipse cx="400" cy="400" rx="320" ry="290" fill="#0f1e35" stroke="#1e3a5f" strokeWidth="1" />

        {/* Seating sections */}
        {stadium.zones.map((zone, i) => {
          const angle = (i / stadium.zones.length) * Math.PI * 2;
          const innerR = 220;
          const outerR = 310;
          const cx = 400 + Math.cos(angle) * (innerR + outerR) / 2;
          const cy = 400 + Math.sin(angle) * ((innerR + outerR) / 2) * 0.9;
          const density = zone.currentOccupancy / zone.capacity;
          const color = getCongestionColor(density);
          const spread = (Math.PI * 2) / stadium.zones.length;

          return (
            <g key={zone.id}>
              <path
                d={`M ${400 + Math.cos(angle - spread / 2) * innerR} ${400 + Math.sin(angle - spread / 2) * innerR * 0.9}
                   A ${innerR} ${innerR * 0.9} 0 0 1 ${400 + Math.cos(angle + spread / 2) * innerR} ${400 + Math.sin(angle + spread / 2) * innerR * 0.9}
                   L ${400 + Math.cos(angle + spread / 2) * outerR} ${400 + Math.sin(angle + spread / 2) * outerR * 0.9}
                   A ${outerR} ${outerR * 0.9} 0 0 0 ${400 + Math.cos(angle - spread / 2) * outerR} ${400 + Math.sin(angle - spread / 2) * outerR * 0.9} Z`}
                fill={`${color}55`}
                stroke={color}
                strokeWidth="1"
                opacity="0.8"
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize="10"
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
              >
                {zone.section}
              </text>
            </g>
          );
        })}

        {/* Field */}
        <ellipse cx="400" cy="400" rx="180" ry="155" fill="#1a4a2e" stroke="#2d7a4f" strokeWidth="2" />
        <ellipse cx="400" cy="400" rx="160" ry="135" fill="none" stroke="#2d7a4f" strokeWidth="1" opacity="0.5" />
        <line x1="400" y1="265" x2="400" y2="535" stroke="#2d7a4f" strokeWidth="1" opacity="0.5" />
        <circle cx="400" cy="400" r="30" fill="none" stroke="#2d7a4f" strokeWidth="1" opacity="0.5" />

        {/* FIFA World Cup text on field */}
        <text x="400" y="395" textAnchor="middle" fill="#2d7a4f" fontSize="11" fontWeight="bold" fontFamily="Outfit, sans-serif" opacity="0.7">
          FIFA WORLD
        </text>
        <text x="400" y="410" textAnchor="middle" fill="#2d7a4f" fontSize="11" fontWeight="bold" fontFamily="Outfit, sans-serif" opacity="0.7">
          CUP 2026
        </text>

        {/* Navigation nodes */}
        {nodes.map(node => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.type === 'gate' ? 8 : node.type === 'elevator' ? 7 : 5}
              fill={
                node.type === 'gate' ? '#3b82f6' :
                node.type === 'elevator' ? '#a78bfa' :
                '#374151'
              }
              stroke={node.isAccessible ? '#4ade80' : '#6b7280'}
              strokeWidth="1"
              opacity="0.8"
            />
            {node.type === 'gate' && (
              <text x={node.x} y={node.y + 18} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="Inter, sans-serif">
                {node.label.replace(' Corridor', '').replace(' (L2)', '')}
              </text>
            )}
          </g>
        ))}

        {/* Route path */}
        {route && route.steps.length > 1 && (
          <g>
            {/* Draw path lines between nodes */}
            {nodes
              .filter(n => route.from && route.to)
              .slice(0, 2)
              .map((_, i) => null)}

            {/* Animated route indicator */}
            <circle
              cx={nodes.find(n => n.id === route.from.id)?.x ?? 400}
              cy={nodes.find(n => n.id === route.from.id)?.y ?? 400}
              r="10"
              fill="#f59e0b"
              opacity="0.9"
            >
              <animate attributeName="r" values="10;14;10" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>

            <circle
              cx={nodes.find(n => n.id === route.to.id)?.x ?? 400}
              cy={nodes.find(n => n.id === route.to.id)?.y ?? 400}
              r="8"
              fill="#22c55e"
              opacity="0.9"
            />
          </g>
        )}

        {/* Emergency assets */}
        {emergencyAssets.filter(a => a.type === 'exit').map(asset => (
          <g key={asset.id}>
            <rect
              x={asset.position.x - 8}
              y={asset.position.y - 8}
              width="16"
              height="16"
              rx="3"
              fill="#16a34a"
              opacity="0.9"
            />
            <text x={asset.position.x} y={asset.position.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">
              E
            </text>
          </g>
        ))}

        {/* Gates ring labels */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map(gateNum => {
          const angle = ((gateNum - 1) / 8) * Math.PI * 2 - Math.PI / 2;
          const r = 345;
          const x = 400 + Math.cos(angle) * r;
          const y = 400 + Math.sin(angle) * r * 0.92;
          return (
            <g key={gateNum}>
              <circle cx={x} cy={y} r="14" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="#60a5fa" fontSize="10" fontWeight="bold" fontFamily="Inter, sans-serif">
                G{gateNum}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(20, 720)">
          {[
            { color: '#00a850', label: 'Low density' },
            { color: '#f59e0b', label: 'Medium' },
            { color: '#ef4444', label: 'High' },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${i * 110}, 0)`}>
              <circle cx="6" cy="6" r="6" fill={`${item.color}55`} stroke={item.color} strokeWidth="1" />
              <text x="16" y="10" fill="#94a3b8" fontSize="10" fontFamily="Inter, sans-serif">{item.label}</text>
            </g>
          ))}
        </g>

        <text x="400" y="775" textAnchor="middle" fill="#374151" fontSize="10" fontFamily="Inter, sans-serif">
          {stadium.name} · Capacity: {stadium.capacity.toLocaleString()} · Interactive Indoor Map
        </text>
      </svg>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 glass rounded-lg px-3 py-2 text-xs border border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <span className="text-green-400 font-semibold">Live Map</span>
        <span className="text-muted-foreground">· {crowdData?.totalOccupancy.toLocaleString() ?? '--'} fans</span>
      </div>
    </div>
  );
}
