import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Globe, TrendingUp, BarChart3, ChevronRight, Zap, Target, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import GlobalMap from './GlobalMap';

const MACRO_INDICATORS = [
  { label: 'Global Trade Vol', value: '+3.4%', trend: 'up' },
  { label: 'Energy Price Idx', value: '114.2', trend: 'down' },
  { label: 'Supply Chain Friction', value: 'Low', trend: 'stable' },
  { label: 'Raw Materials Demand', value: '+5.1%', trend: 'up' }
];

const INTELLIGENCE_HEADLINES = [
  "New AI integration streamlines global logistics in major ports.",
  "Energy sector pivots rapidly towards decarbonization models.",
  "Commodity markets stabilize amidst renewed international trade agreements.",
  "Emerging tech hubs drive demand for rare earth elements."
];

const SECTORS = ['Logistics', 'Energy', 'Mining', 'Materials', 'Technology'];

export function HeroSection({ language }: { language: 'en' | 'es' | 'zh' | 'ar' }) {
  const [activeHeadline, setActiveHeadline] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSector, setActiveSector] = useState(SECTORS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeadline((prev) => (prev + 1) % INTELLIGENCE_HEADLINES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-16 px-6 overflow-hidden bg-brand">
      {/* Subtle Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-deep/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl w-full z-10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Headlines, Search, Indicators */}
        <div className="lg:col-span-6 space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Activity className="w-3.5 h-3.5" />
              Survvi Opulence Insights
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight tracking-tight text-white">
              The World's Most <br/>
              <span className="bg-gradient-to-r from-accent to-accent-deep bg-clip-text text-transparent">
                Advanced Industrial
              </span> <br/>
              Intelligence Platform.
            </h1>
            
            {/* Rotating Headlines */}
            <div className="h-16 relative overflow-hidden mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHeadline}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 text-white/50 text-lg font-light leading-relaxed pr-8"
                >
                  <span className="font-bold text-accent mr-2">LIVE:</span>
                  {INTELLIGENCE_HEADLINES[activeHeadline]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* AI Research Assistant Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative max-w-xl group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-deep rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative flex items-center bg-[#0a0d12]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="pl-4 pr-3 text-accent">
                <Target className="w-5 h-5" />
              </div>
              <input 
                type="text"
                placeholder="Ask the AI Research Assistant about any sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30 h-12"
              />
              <button className="bg-white/5 hover:bg-accent hover:text-brand text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                Analyze
              </button>
            </div>
          </motion.div>

          {/* Live Macroeconomic Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl"
          >
            {MACRO_INDICATORS.map((indicator, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-accent/30 transition-colors">
                <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2">{indicator.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-white">{indicator.value}</span>
                  {indicator.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : 
                   indicator.trend === 'down' ? <TrendingUp className="w-3 h-3 text-red-400 rotate-180" /> : 
                   <Activity className="w-3 h-3 text-white/40" />}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Animated World Map and Sector Selector */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-6 relative h-full min-h-[500px] flex flex-col items-center justify-center"
        >
          {/* Interactive Sector Selector */}
          <div className="absolute top-0 right-0 z-20 flex flex-wrap justify-end gap-2 p-4">
            {SECTORS.map(sector => (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border backdrop-blur-md",
                  activeSector === sector
                    ? "bg-accent text-brand border-accent"
                    : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white"
                )}
              >
                {sector}
              </button>
            ))}
          </div>

          {/* Animated Map Container */}
          <div className="relative w-full h-[400px] bg-brand-light/20 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Using the GlobalMap component here scaled down or custom svg */}
            <div className="absolute inset-0 scale-[1.5] origin-center opacity-80 pointer-events-none">
               <GlobalMap  />
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-[#0a0d12]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">{activeSector} Intelligence</h4>
                  <p className="text-[10px] text-white/40 font-mono">Monitoring 142 Active Global Nodes</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
