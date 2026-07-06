import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Satellite, 
  Navigation, 
  Crosshair, 
  Map, 
  Compass, 
  Eye, 
  Flame, 
  Activity, 
  ShieldAlert, 
  ArrowUpRight, 
  Calendar,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface TargetDetails {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  clientSector: string;
  metricLabel: string;
  metricValue: string;
  resolution: string;
  status: 'Normal' | 'Critical Alert' | 'Elevated Activity' | 'Optimized';
  statusColor: string;
  backgroundUrl: string;
  mapCoords: { top: string; left: string };
  telemetryData: { period: string; value: number }[];
  intelDrops: { time: string; text: string; category: string; impact: 'Bullish' | 'Bearish' | 'Neutral' }[];
}

const TARGETS: TargetDetails[] = [
  {
    id: 'cushing',
    name: 'Cushing Oil Storage Terminal',
    location: 'Cushing, Oklahoma, USA',
    coordinates: '35.9845° N, 96.7725° W',
    clientSector: 'Macro Energy Funds & Commodity Traders',
    metricLabel: 'Floating Roof Drawdown Volume',
    metricValue: '42.8M bbls (Capacity: 76%)',
    resolution: '0.3m Ultra-SAR Volumetric',
    status: 'Elevated Activity',
    statusColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    backgroundUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=80&w=1200&auto=format&fit=crop',
    mapCoords: { top: '38%', left: '28%' },
    telemetryData: [
      { period: 'Wk 20', value: 48.2 },
      { period: 'Wk 21', value: 47.1 },
      { period: 'Wk 22', value: 45.8 },
      { period: 'Wk 23', value: 44.5 },
      { period: 'Wk 24', value: 43.1 },
      { period: 'Wk 25', value: 42.8 }
    ],
    intelDrops: [
      { time: '12 mins ago', text: 'Shadow cast SAR calculations indicate 32 floating-roof tanks lowered by an average of 4.1% WoW.', category: 'Stockpile Runoff', impact: 'Bullish' },
      { time: '3 hrs ago', text: 'Permian pipeline inbound flow rates stabilized at 540k bpd. Clearing house constraints easing.', category: 'Logistics', impact: 'Neutral' },
      { time: '1 day ago', text: 'Discrepancy with official EIA report widening: SAR estimates physical inventory 2.4M bbls lower than reported.', category: 'Arbitrage', impact: 'Bullish' }
    ]
  },
  {
    id: 'bab-el-mandeb',
    name: 'Bab-el-Mandeb Transit Corridor',
    location: 'Yemen/Djibouti Chokepoint',
    coordinates: '12.5931° N, 43.3444° E',
    clientSector: 'Sovereign Wealth & Maritime Insurers',
    metricLabel: 'Daily Tanker Bypass Index',
    metricValue: '38 Vessels (Normal: 110)',
    resolution: '0.5m Marine SAR Cluster',
    status: 'Critical Alert',
    statusColor: 'text-red-400 bg-red-400/10 border-red-400/20',
    backgroundUrl: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?q=80&w=1200&auto=format&fit=crop',
    mapCoords: { top: '58%', left: '56%' },
    telemetryData: [
      { period: 'Day 1', value: 92 },
      { period: 'Day 2', value: 78 },
      { period: 'Day 3', value: 61 },
      { period: 'Day 4', value: 44 },
      { period: 'Day 5', value: 40 },
      { period: 'Day 6', value: 38 }
    ],
    intelDrops: [
      { time: '4 mins ago', text: 'Coordinated SAR tracking reveals 14 VLCC tankers actively executing high-speed maneuvers turning south of Aden.', category: 'Tactical Route', impact: 'Bullish' },
      { time: '2 hrs ago', text: 'Sovereign naval task force deploys additional sensor escorts. Insurance premiums rise 15% for transit.', category: 'Sovereign Risk', impact: 'Bullish' },
      { time: '12 hrs ago', text: 'Bypassing through Cape of Good Hope added ~11.5 days to standard Suez routes, raising global bunker fuel consumption.', category: 'Supply Chain', impact: 'Bullish' }
    ]
  },
  {
    id: 'tsmc-fab18',
    name: 'TSMC Fab 18 Giga-Facility',
    location: 'Hsinchu Science Park, Taiwan',
    coordinates: '23.1118° N, 120.2711° E',
    clientSector: 'Global Tech Allocators & Supply Chain Planners',
    metricLabel: 'Thermal Emissions Cleanroom Index',
    metricValue: '98.4% Operating Capacity',
    resolution: '0.25m Multi-Spectral SAR',
    status: 'Normal',
    statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    backgroundUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    mapCoords: { top: '44%', left: '78%' },
    telemetryData: [
      { period: 'Q1', value: 94.2 },
      { period: 'Q2', value: 95.8 },
      { period: 'Q3', value: 96.5 },
      { period: 'Q4', value: 97.2 },
      { period: 'Q1 (Current)', value: 98.4 }
    ],
    intelDrops: [
      { time: '25 mins ago', text: 'Infrared SAR signatures confirm ultra-high heat dissipation across 3nm fabrication wings.', category: 'Thermal Output', impact: 'Neutral' },
      { time: '4 hrs ago', text: 'Gas containment delivery tracks show nitrogen tanker frequency increased 12% WoW, showing uninterrupted flow.', category: 'Logistics', impact: 'Neutral' },
      { time: '1 day ago', text: 'No structural structural disruptions detected from recent regional seismic activity; yield targets remain on schedule.', category: 'Resilience', impact: 'Neutral' }
    ]
  },
  {
    id: 'norilsk-smelter',
    name: 'Norilsk Metallurgical Complex',
    location: 'Siberian Arctic Russia',
    coordinates: '69.3497° N, 88.2012° E',
    clientSector: 'Industrial Arbitragers & Strategic Metals Stockpilers',
    metricLabel: 'Sulfide Plume & Furnace Output',
    metricValue: '114% Smelter Yield',
    resolution: '0.5m All-Weather Arctic SAR',
    status: 'Optimized',
    statusColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    backgroundUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=1200&auto=format&fit=crop',
    mapCoords: { top: '22%', left: '62%' },
    telemetryData: [
      { period: 'Feb', value: 98 },
      { period: 'Mar', value: 102 },
      { period: 'Apr', value: 105 },
      { period: 'May', value: 109 },
      { period: 'Jun', value: 112 },
      { period: 'Jul', value: 114 }
    ],
    intelDrops: [
      { time: '55 mins ago', text: 'Continuous active illumination through Arctic blizzard reveals rapid ore stockpile accumulation near smelting hall B.', category: 'Arctic Output', impact: 'Bearish' },
      { time: '5 hrs ago', text: 'Chemical atmospheric backscatter indexes indicate sulfur dioxide plume density expanded by 18% over Norilsk basin.', category: 'Emissions', impact: 'Bearish' },
      { time: '2 days ago', text: 'Arbitrage corridors to Eastern shipping hubs remain high-volume despite logistics and shipping insurance caps.', category: 'Sanction Corridor', impact: 'Neutral' }
    ]
  }
];

export function OrbitalAssetMonitor() {
  const [selectedId, setSelectedId] = useState<string>('cushing');

  const activeTarget = useMemo(() => {
    return TARGETS.find(t => t.id === selectedId) || TARGETS[0];
  }, [selectedId]);

  return (
    <div className="w-full h-full bg-brand p-6 rounded-3xl border border-white/5 flex flex-col gap-6 text-white font-sans" id="orbital-sar-monitor">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
            <Satellite className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight">Sovereign Orbital SAR Monitor</h3>
            <p className="text-sm text-gray-400">All-Weather Synthetic Aperture Radar intelligence on micro-physical bottlenecks</p>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center self-start md:self-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Live Satellite Grid Sync
        </div>
      </div>

      {/* Target selector tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {TARGETS.map((target) => {
          const isActive = target.id === selectedId;
          return (
            <button
              key={target.id}
              onClick={() => setSelectedId(target.id)}
              className={cn(
                "p-3.5 text-left rounded-2xl border transition-all duration-300 flex flex-col justify-between h-24 relative overflow-hidden group",
                isActive 
                  ? "bg-accent/15 border-accent text-white shadow-[0_4px_20px_-5px_rgba(197,160,89,0.3)]" 
                  : "bg-brand-light/10 border-white/5 text-gray-400 hover:bg-brand-light/20 hover:border-white/10 hover:text-white"
              )}
            >
              <div className="z-10 flex items-start justify-between w-full">
                <span className="text-[10px] font-mono text-accent uppercase tracking-wider">{target.coordinates.split(',')[0]}</span>
                <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border tracking-widest", target.statusColor)}>
                  {target.status.split(' ')[0]}
                </span>
              </div>
              <div className="z-10 mt-2">
                <h5 className="text-xs font-bold leading-snug group-hover:text-accent transition-colors">{target.name}</h5>
                <p className="text-[9px] text-gray-500 font-medium truncate mt-0.5">{target.clientSector.split(' & ')[0]}</p>
              </div>
              
              {/* Subtle background highlight for active tab */}
              {isActive && (
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
                  <Compass className="w-16 h-16 text-accent" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[420px]">
        
        {/* Left 7 Columns: Visual Target Lock on Global Map */}
        <div className="lg:col-span-7 bg-brand-light/10 rounded-3xl border border-white/5 p-1 relative overflow-hidden flex flex-col justify-between group min-h-[300px]">
          {/* Earth/Sovereign Grid background overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1500&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-luminosity"></div>
          
          {/* Scanline radar sweep animation */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }} 
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
            className="absolute left-0 right-0 h-0.5 bg-accent/30 shadow-[0_0_15px_rgba(197,160,89,0.5)] z-10"
          />

          {/* Grid coordinates decorative lines */}
          <div className="absolute inset-x-0 top-1/2 border-b border-white/5 pointer-events-none z-0"></div>
          <div className="absolute inset-y-0 left-1/2 border-r border-white/5 pointer-events-none z-0"></div>

          {/* Dynamic Active Crosshair with lock-on target effect */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTarget.id}
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", damping: 15 }}
              style={{ top: activeTarget.mapCoords.top, left: activeTarget.mapCoords.left }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
            >
              {/* Spinning compass rings */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 rounded-full border border-accent/20 animate-spin" style={{ animationDuration: '8s' }}></div>
                <div className="absolute w-8 h-8 rounded-full border border-dashed border-accent/40 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}></div>
                <div className="w-5 h-5 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.6)]">
                  <Crosshair className="w-3 h-3 text-accent animate-pulse" />
                </div>
              </div>
              <div className="mt-2.5 px-2 py-1 bg-brand/90 backdrop-blur-md border border-accent/30 rounded-lg text-[9px] uppercase font-mono text-accent font-bold tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping"></span>
                Lock: {activeTarget.id.toUpperCase()}-SAR
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Header Metadata on Map */}
          <div className="z-10 p-5 bg-gradient-to-b from-brand/90 via-brand/40 to-transparent flex items-start justify-between w-full">
            <div className="space-y-1">
              <span className="text-[10px] text-accent font-mono font-bold uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                Target Lock
              </span>
              <h4 className="text-lg font-bold tracking-tight text-white mt-1.5">{activeTarget.name}</h4>
              <p className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-accent" />
                {activeTarget.coordinates} | {activeTarget.location}
              </p>
            </div>
            <div className="text-right font-mono text-[10px] text-gray-500 hidden sm:block">
              <div>AZIMUTH: 184.22°</div>
              <div>ELEVATION: 41.50°</div>
              <div>SWATH WIDTH: 250km</div>
            </div>
          </div>

          {/* Footer Metadata on Map */}
          <div className="z-10 p-4 bg-brand/80 backdrop-blur-md border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-accent" />
                <span className="text-[11px] font-mono text-gray-300">Res: <strong className="text-white font-bold">{activeTarget.resolution}</strong></span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-5">
                <Layers className="w-4 h-4 text-accent" />
                <span className="text-[11px] font-mono text-gray-300">Band: <strong className="text-white font-bold">X-Band Active</strong></span>
              </div>
            </div>
            <div className="text-xs font-mono text-gray-400">
              Intel Target: <span className="text-accent font-bold">{activeTarget.clientSector}</span>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Real-time Telemetry Data & Intel Logs */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Dynamic Metrics Chart */}
          <div className="bg-brand-light/10 p-5 rounded-3xl border border-white/5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Temporal SAR Trend</h4>
              <span className="text-[10px] text-accent font-mono flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Telemetry Loop
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-gray-400 font-medium">{activeTarget.metricLabel}</p>
              <h3 className="text-xl font-bold tracking-tight text-accent mt-0.5">{activeTarget.metricValue}</h3>
            </div>

            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeTarget.telemetryData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id={`colorTelemetry-${activeTarget.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="period" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                    itemStyle={{ color: '#fff', fontSize: 11 }} 
                    labelStyle={{ color: '#C5A059', fontSize: 9, fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="SAR Metric"
                    stroke="#C5A059" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#colorTelemetry-${activeTarget.id})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic Intel Drops */}
          <div className="flex-1 bg-brand-light/10 p-5 rounded-3xl border border-white/5 flex flex-col overflow-hidden min-h-[220px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent animate-pulse" />
                Active Tactical Drops
              </h4>
              <span className="text-[10px] text-gray-500 font-mono">
                {activeTarget.intelDrops.length} Live Feeds
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {activeTarget.intelDrops.map((intel, idx) => (
                  <motion.div 
                    key={intel.text}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="pb-3 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-accent uppercase font-mono bg-accent/5 px-1.5 py-0.5 rounded border border-accent/10">
                          {intel.category}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono">{intel.time}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider", 
                        intel.impact === 'Bullish' 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : intel.impact === 'Bearish'
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      )}>
                        {intel.impact}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{intel.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
