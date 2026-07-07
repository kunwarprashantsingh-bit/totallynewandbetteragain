import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, ComposedChart, Line } from 'recharts';
import { AlertCircle, Filter, Activity, TrendingUp, Layers, MapPin, Maximize2 } from 'lucide-react';

// --- 1. Predictive Scenario Modeler (Commodity Forecast) ---
const forecastData = [
  { year: '2023', base: 4100, severe: 4100, optimized: 4100, demand: 4050 },
  { year: '2024', base: 4150, severe: 4150, optimized: 4150, demand: 4180 },
  { year: '2025', base: 4200, severe: 3900, optimized: 4300, demand: 4350 },
  { year: '2026', base: 4220, severe: 3750, optimized: 4450, demand: 4500 },
  { year: '2027', base: 4250, severe: 3600, optimized: 4600, demand: 4680 },
];

export const CementShortageChart = () => {
  const [scenario, setScenario] = useState<'base' | 'severe' | 'optimized'>('base');

  return (
    <div className="w-full h-full bg-[#0b0f19] flex flex-col relative font-sans p-6 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white/90">Global Cement Supply vs Demand Forecast</h3>
          <p className="text-xs text-white/50 mt-1">Projecting structural deficits based on macro-economic shifts (M Tons)</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          {(['base', 'severe', 'optimized'] as const).map(s => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-md transition-colors ${scenario === s ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      
      <div className="absolute top-6 right-6 lg:right-auto lg:top-auto lg:bottom-6 lg:left-6 z-10 pointer-events-none opacity-50 text-[9px] uppercase tracking-widest font-mono text-white/70">
        SOURCE: SOI Predictive Analytics Core
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={scenario === 'severe' ? '#ef4444' : scenario === 'optimized' ? '#10b981' : '#3b82f6'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={scenario === 'severe' ? '#ef4444' : scenario === 'optimized' ? '#10b981' : '#3b82f6'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey={scenario} 
              name="Projected Supply" 
              stroke={scenario === 'severe' ? '#ef4444' : scenario === 'optimized' ? '#10b981' : '#3b82f6'} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSupply)" 
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              name="Global Demand" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Deficit Warning Overlay */}
        <AnimatePresence>
          {scenario === 'severe' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-1/4 right-10 bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-start gap-3 max-w-[200px] backdrop-blur-sm"
            >
              <AlertCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1">Critical Deficit</div>
                <div className="text-white/70 text-[9px] leading-relaxed">Forecasts project a 1.08B Ton supply gap by 2027 under severe constraints.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- 2. Global Supply Chain Network (Interactive Nodes) ---
const nodes = [
  { id: 'manufacturing_hub_1', x: 20, y: 40, label: 'Shenzhen Hub', status: 'optimal', value: '420k TEU' },
  { id: 'manufacturing_hub_2', x: 25, y: 70, label: 'Vietnam Plant', status: 'optimal', value: '180k TEU' },
  { id: 'transit_node_1', x: 50, y: 55, label: 'Singapore Transshipment', status: 'warning', value: '600k TEU' },
  { id: 'transit_node_2', x: 65, y: 30, label: 'Suez Canal', status: 'critical', value: '250k TEU' },
  { id: 'dist_hub_1', x: 85, y: 25, label: 'Rotterdam Port', status: 'optimal', value: '310k TEU' },
  { id: 'dist_hub_2', x: 80, y: 75, label: 'LA Port', status: 'warning', value: '290k TEU' },
];

const edges = [
  { source: 0, target: 2 },
  { source: 1, target: 2 },
  { source: 2, target: 3 },
  { source: 3, target: 4 },
  { source: 2, target: 5 },
];

export const FleetTrackingMap = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  return (
    <div className="w-full h-full bg-[#0b0f19] relative font-sans overflow-hidden">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-sm font-semibold text-white/90">Global Logistics Topology</h3>
        <p className="text-xs text-white/50 mt-1">Real-time throughput and vulnerability mapping</p>
      </div>

      <div className="absolute bottom-6 left-6 z-10 pointer-events-none opacity-50 text-[9px] uppercase tracking-widest font-mono text-white/70">
        SOURCE: SOI Maritime Logistics Node
      </div>

      <div className="absolute top-6 right-6 z-10 flex gap-4 text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-white/60">Optimal</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500" /> <span className="text-white/60">Congested</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> <span className="text-white/60">Disrupted</span></div>
      </div>

      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        {/* Draw edges with animated gradients */}
        <defs>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
        </defs>
        
        {edges.map((edge, i) => {
          const source = nodes[edge.source];
          const target = nodes[edge.target];
          // Simple curved path
          const path = `M ${source.x}% ${source.y}% Q ${(source.x + target.x) / 2}% ${(source.y + target.y) / 2 - 10}% ${target.x}% ${target.y}%`;
          
          return (
            <g key={i}>
              <path d={path} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <path d={path} fill="none" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 12" className="animate-[dash_20s_linear_infinite]" />
            </g>
          );
        })}
      </svg>

      {/* Draw Nodes */}
      {nodes.map((node, i) => (
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onMouseEnter={() => setActiveNode(i)}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${activeNode === i ? 'scale-125' : 'scale-100'}
            ${node.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-400' : 
              node.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}
            style={{ width: '32px', height: '32px' }}
          >
            <MapPin className="w-4 h-4" />
            {(node.status === 'warning' || node.status === 'critical') && (
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${node.status === 'critical' ? 'bg-red-500 animate-ping' : 'bg-yellow-500'}`} />
            )}
          </div>
          
          <AnimatePresence>
            {activeNode === i && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 min-w-[140px] shadow-xl pointer-events-none"
              >
                <div className="text-[10px] font-semibold text-white/90 whitespace-nowrap mb-1">{node.label}</div>
                <div className="text-[9px] text-white/50 mb-2 uppercase tracking-wider flex justify-between">
                  Status: 
                  <span className={node.status === 'optimal' ? 'text-emerald-400' : node.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}>
                    {node.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-white pt-2 border-t border-white/10">Vol: {node.value}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}} />
    </div>
  );
};

// --- 3. Port Congestion Analytics (Bar Chart Heatmap) ---
const portData = [
  { name: 'Shanghai', wait: 24, variance: 2, status: 'normal' },
  { name: 'Singapore', wait: 84, variance: 45, status: 'critical' },
  { name: 'Rotterdam', wait: 32, variance: 5, status: 'normal' },
  { name: 'Los Angeles', wait: 56, variance: 18, status: 'warning' },
  { name: 'Busan', wait: 28, variance: 4, status: 'normal' },
];

export const SingaporeBottleneckMap = () => {
  return (
    <div className="w-full h-full bg-[#0b0f19] flex flex-col font-sans p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-semibold text-white/90">Maritime Congestion Index</h3>
          <p className="text-xs text-white/50 mt-1">Average anchor wait times (hours) across major transshipment hubs</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-md flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Anomaly Detected</span>
        </div>
      </div>
      
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none opacity-50 text-[9px] uppercase tracking-widest font-mono text-white/70">
        SOURCE: Global Port Authority Data & SOI Analytics
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={portData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }} width={80} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#111827] border border-white/10 rounded-lg p-3 shadow-xl">
                      <div className="text-xs font-semibold text-white mb-2">{data.name} Port</div>
                      <div className="flex justify-between gap-4 text-[11px] mb-1">
                        <span className="text-white/50">Avg Wait:</span>
                        <span className="text-white font-mono">{data.wait} hrs</span>
                      </div>
                      <div className="flex justify-between gap-4 text-[11px]">
                        <span className="text-white/50">Variance vs 30d:</span>
                        <span className={data.variance > 20 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
                          +{data.variance}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={40} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ position: 'top', value: 'Historical Avg', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
            <Bar dataKey="wait" radius={[0, 4, 4, 0]} barSize={24}>
              {portData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.status === 'critical' ? '#ef4444' : entry.status === 'warning' ? '#f59e0b' : '#3b82f6'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- 4. Inventory Allocation Treemap (Grid Abstraction) ---
const inventoryCategories = [
  { name: 'Semiconductors', allocated: 85, total: 100, color: 'bg-blue-500' },
  { name: 'Rare Earths', allocated: 98, total: 100, color: 'bg-red-500', alert: true },
  { name: 'Industrial Chemicals', allocated: 45, total: 100, color: 'bg-emerald-500' },
  { name: 'Steel Components', allocated: 60, total: 100, color: 'bg-emerald-500' },
];

export const WarehouseGrid = () => {
  return (
    <div className="w-full h-full bg-[#0b0f19] flex flex-col font-sans p-6 overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white/90">Strategic Reserve Allocation Matrix</h3>
          <p className="text-xs text-white/50 mt-1">Utilization relative to required baseline buffer capacities</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1.5 rounded-md">
            <Filter className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[9px] text-white/60 uppercase tracking-wider font-semibold">Tier 1 Assets</span>
          </div>
          <div className="pointer-events-none opacity-50 text-[9px] uppercase tracking-widest font-mono text-white/70">
            SOURCE: SOI Asset Tracking Node
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
        {inventoryCategories.map((cat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col relative group hover:bg-white/[0.04] transition-colors">
            {cat.alert && (
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            )}
            <div className="text-xs font-medium text-white/80 mb-4">{cat.name}</div>
            
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-light font-mono text-white">{cat.allocated}%</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Utilized</span>
              </div>
              
              {/* Custom Progress Bar Segmented */}
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden flex gap-[1px]">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const percentage = (idx + 1) * 5;
                  const isActive = percentage <= cat.allocated;
                  let colorClass = 'bg-white/10';
                  
                  if (isActive) {
                    if (cat.allocated > 90) colorClass = 'bg-red-500';
                    else if (cat.allocated > 75) colorClass = 'bg-yellow-500';
                    else colorClass = 'bg-emerald-500';
                  }
                  
                  return (
                    <div key={idx} className={`flex-1 h-full ${colorClass} transition-colors duration-500`} style={{ opacity: isActive ? 1 : 0.3 }} />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
