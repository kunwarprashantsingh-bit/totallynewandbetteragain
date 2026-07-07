import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, FileText, Building2, Zap, Search, Bookmark, 
  Compass, FolderHeart, ChevronUp, ChevronDown, X, Sparkles, 
  Download, Play, ChevronRight, Clock, Bot,
  ExternalLink, Eye, EyeOff, Terminal, Sliders, ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, LineChart, Line 
} from 'recharts';
import { cn } from '../lib/utils';
import { NEWS_TOPICS } from '../constants';
import { translations } from '../translations';
import { Language, NewsArticle, ResearchReport, MarketData } from '../types';
import { ai } from '../services/geminiService';
import AIDispatchCompiler from './AIDispatchCompiler';
import NewsletterSubscription from './NewsletterSubscription';
import { 
  FleetTrackingMap, 
  CementShortageChart, 
  SingaporeBottleneckMap, 
  WarehouseGrid 
} from './SovereignVisualizers';

const GEOPOLITICAL_BULLETINS = [
  {
    topic: 'Maritime Security',
    threat: 'critical',
    title: 'Red Sea shipping lane drone activity escalates',
    commodity: 'Crude Oil / Dry Freight',
    action: 'Divert Panamax bulk freight around Horn of Africa immediately. Re-route safety reserves.',
    impact: 'Adds +12 days of transit to European hubs, spiking freight premiums by 22%.'
  },
  {
    topic: 'Carbon Trade Policy',
    threat: 'moderate',
    title: 'EU CBAM Phase-2 carbon import tariffs declared',
    commodity: 'Steel / Aluminum / Cement',
    action: 'Initiate compliance scope audits for external blast-furnace imports. Transition to electric-arc kiln certified suppliers.',
    impact: 'Raises regulatory penalty risks on carbon-heavy cement clinker imports by 30%.'
  },
  {
    topic: 'Global Food Supply',
    threat: 'optimal',
    title: 'India lifts non-basmati white rice export embargo',
    commodity: 'Agricultural Bulk / Grain',
    action: 'Utilize standard Panama lane options for US Gulf-to-Asia routes; cancel overland rail trans-shipments.',
    impact: 'Slashes international bulk grain transport cost thresholds by 14% on spot markets.'
  }
];

// Helper to use Local Storage within components
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

interface SovereignIntelligenceTerminalProps {
  language: Language;
  isPremium: boolean;
  time: Date;
  terminalTab: 'materials' | 'energy' | 'news' | 'research';
  setTerminalTab: (tab: 'materials' | 'energy' | 'news' | 'research') => void;
  onMacroClick: () => void;
  
  // News hub props
  activeNewsTopic: string;
  setActiveNewsTopic: (topic: string) => void;
  loadingNewsletter: boolean;
  newsletterNews: NewsArticle[];
  newsletterDate: string;
  pinnedNews: NewsArticle[];
  setPinnedNews: (p: NewsArticle[]) => void;
  setSelectedResearchItem: (item: any) => void;
  workspace: any[];
  setWorkspace: (w: any[]) => void;
  
  // Research hub props
  activeResearchTab: 'materials' | 'energy' | 'shipping' | 'steel' | 'chemicals' | 'mining' | 'agribusiness' | 'logistics' | 'ai' | 'pharma' | 'other';
  setActiveResearchTab: (tab: any) => void;
  loadingResearch: boolean;
  researchChartData: any[];
  researchSourceFilter: string;
  setResearchSourceFilter: (s: string) => void;
  researchSources: string[];
  researchDateFilter: string;
  setResearchDateFilter: (d: string) => void;
  researchDates: string[];
  filteredResearch: ResearchReport[];
}

const ToolSkeleton = () => (
  <div className="w-full h-96 bg-brand-light/20 rounded-3xl animate-pulse flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest text-white/20">Securing Live Data Stream...</span>
    </div>
  </div>
);

const GOOGLE_NEWS_QUERIES: Record<string, string> = {
  "Cement": '"cement clinker" OR "concrete production" OR "cement manufacturing" OR "limestone quarries"',
  "Bulk Shipping": '"dry bulk shipping" OR "Panamax" OR "Capesize" OR "Baltic Dry Index"',
  "Paper Industry": '"paper industry" OR "pulp mill" OR "containerboard packaging" OR "forestry lumber"',
  "Energy": '"crude oil" OR "natural gas" OR "LNG transport" OR "power grid infrastructure"',
  "Steel": '"steel production" OR "electric arc furnace" OR "scrap steel" OR "metallurgical coal"',
  "Chemicals": '"petrochemicals" OR "industrial chemicals" OR "polymers supply" OR "ethylene pipeline"',
  "Mining": '"lithium mining" OR "copper mining" OR "cobalt extraction" OR "rare earth refinery"',
  "Defense & Aerospace": '"defense aerospace" OR "military titanium" OR "national security logistics" OR "aircraft manufacturing"',
  "Logistics": '"freight rates" OR "rail freight" OR "trucking logistics" OR "multimodal transport"',
  "Pharmaceuticals": '"pharmaceutical supply chain" OR "active pharmaceutical ingredients" OR "drug shortage"'
};

export const SovereignIntelligenceTerminal = ({
  language,
  isPremium,
  time,
  terminalTab,
  setTerminalTab,
  onMacroClick,
  activeNewsTopic,
  setActiveNewsTopic,
  loadingNewsletter,
  newsletterNews,
  newsletterDate,
  pinnedNews,
  setPinnedNews,
  setSelectedResearchItem,
  workspace,
  setWorkspace,
  activeResearchTab,
  setActiveResearchTab,
  loadingResearch,
  researchChartData,
  researchSourceFilter,
  setResearchSourceFilter,
  researchSources,
  researchDateFilter,
  setResearchDateFilter,
  researchDates,
  filteredResearch
}: SovereignIntelligenceTerminalProps) => {
  const t = translations[language];

  // News desk state variables
  const [activeBulletinIdx, setActiveBulletinIdx] = useState(0);
  const [discloseBulletin, setDiscloseBulletin] = useState(false);
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [newsSentimentFilter, setNewsSentimentFilter] = useState("All");
  const [newsImpactFilter, setNewsImpactFilter] = useState("All");
  const [briefcaseAnalysis, setBriefcaseAnalysis] = useState("");
  const [synthesizingBriefcase, setSynthesizingBriefcase] = useState(false);
  const [isBriefcaseOpen, setIsBriefcaseOpen] = useState(false);

  // Research hub states
  const [sectorSynthesis, setSectorSynthesis] = useState("");
  const [synthesizingSector, setSynthesizingSector] = useState(false);
  const [showSectorSynthesisModal, setShowSectorSynthesisModal] = useState(false);

  // Filtered newsletter news
  const filteredNewsletterNews = useMemo(() => {
    return newsletterNews.filter(article => {
      const query = newsSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        article.title.toLowerCase().includes(query) || 
        article.summary.toLowerCase().includes(query) || 
        article.source.toLowerCase().includes(query);

      const sentiment = article.sentiment || "Neutral";
      const matchesSentiment = newsSentimentFilter === "All" || 
        sentiment.toLowerCase() === newsSentimentFilter.toLowerCase();

      const impact = article.impact || "Medium";
      const matchesImpact = newsImpactFilter === "All" || 
        impact.toLowerCase() === newsImpactFilter.toLowerCase();

      return matchesSearch && matchesSentiment && matchesImpact;
    });
  }, [newsletterNews, newsSearchQuery, newsSentimentFilter, newsImpactFilter]);

  return (
    <section id="intelligence-terminal" className="py-10 px-6 max-w-7xl mx-auto scroll-mt-24">
      <div className="bg-brand-light/20 border border-accent/25 rounded-[36px] overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.15)] relative">
        
        {/* Bloomberg Terminal Top bar style */}
        <div className="bg-brand border-b border-white/10 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-white/40 ml-2">SURVVI_OPULENCE_INTEL_STREAM v4.16</span>
          </div>
          
          {/* Terminal Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-brand-light/60 p-1 rounded-xl border border-white/5">
            {[
              { id: 'news', label: 'Geopolitical Risk Desk', icon: Newspaper },
              { id: 'research', label: 'The Intelligence Hub', icon: FileText },
              { id: 'materials', label: 'Material Innovations', icon: Building2 },
              { id: 'energy', label: 'Energy Transition', icon: Zap }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = terminalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTerminalTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all cursor-pointer whitespace-nowrap",
                    isActive 
                      ? "bg-accent text-brand shadow-[0_0_15px_rgba(197,160,89,0.25)] font-bold" 
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-brand" : "text-accent")} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-accent">
            <span>UTC: {time.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Viewport wrapper */}
        <div className="relative p-6 md:p-8 min-h-[500px] z-10 bg-[#060a12]/60">
          <AnimatePresence mode="wait">
            
            {/* Tab: News Desk */}
            {terminalTab === 'news' && (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col items-center text-center mb-10 gap-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                      <Newspaper className="w-3 h-3" />
                      Global Intelligence
                    </div>
                    <h3 className="text-3xl font-extrabold uppercase tracking-tight text-white mb-4">Astraeus News Hub</h3>
                    <p className="text-white/50 text-sm max-w-lg mx-auto">
                      Access raw market signals, vessel itineraries, policy dispatches, and structural analyses updated in real-time.
                    </p>
                  </div>

                  {/* Topic Select List */}
                  <div className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {NEWS_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => setActiveNewsTopic(topic)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                            activeNewsTopic === topic
                              ? "bg-accent text-brand shadow-lg font-black"
                              : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>

                    {/* Direct Google News Search Link */}
                    <div className="flex justify-center mt-3 transition-all">
                      <a
                        href={`https://news.google.com/search?q=${encodeURIComponent(GOOGLE_NEWS_QUERIES[activeNewsTopic] || activeNewsTopic)}&hl=en-US&gl=US&ceid=US:en`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-red-600/30 border border-red-500/30 transform hover:-translate-y-0.5"
                      >
                        <Newspaper className="w-4 h-4 animate-pulse" />
                        Direct Access: Open "{activeNewsTopic}" Live on Google News ↗
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-8 max-w-5xl mx-auto">
                  {/* Geopolitical Risk Flash Bulletins Widget */}
                  <div className="w-full bg-brand/50 border border-white/10 rounded-3xl p-5 lg:p-6 backdrop-blur-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/35 rounded text-[8px] font-extrabold text-red-400 tracking-wider">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" />
                          LIVE INTEL FEED
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">Sovereign Geopolitical Alerts</span>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        <button 
                          onClick={() => {
                            setDiscloseBulletin(false);
                            setActiveBulletinIdx(prev => (prev === 0 ? GEOPOLITICAL_BULLETINS.length - 1 : prev - 1));
                          }}
                          className="p-1 hover:bg-white/5 rounded border border-white/5 text-white/40 hover:text-white transition-all text-xs cursor-pointer"
                        >
                          ◀
                        </button>
                        <span className="text-[9px] font-mono text-white/40">{activeBulletinIdx + 1} / {GEOPOLITICAL_BULLETINS.length}</span>
                        <button 
                          onClick={() => {
                            setDiscloseBulletin(false);
                            setActiveBulletinIdx(prev => (prev === GEOPOLITICAL_BULLETINS.length - 1 ? 0 : prev + 1));
                          }}
                          className="p-1 hover:bg-white/5 rounded border border-white/5 text-white/40 hover:text-white transition-all text-xs cursor-pointer"
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-6 text-left">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-widest font-mono",
                            GEOPOLITICAL_BULLETINS[activeBulletinIdx].threat === 'critical' ? 'bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse' :
                            GEOPOLITICAL_BULLETINS[activeBulletinIdx].threat === 'moderate' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                            GEOPOLITICAL_BULLETINS[activeBulletinIdx].threat === 'optimal' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                            'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          )}>
                            THREAT LEVEL: {GEOPOLITICAL_BULLETINS[activeBulletinIdx].threat}
                          </span>
                          <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].topic}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white tracking-tight leading-relaxed">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].title}</h4>
                      </div>

                      <button 
                        onClick={() => setDiscloseBulletin(!discloseBulletin)}
                        className="px-3.5 py-1.5 bg-white/5 hover:bg-accent hover:text-brand border border-white/10 hover:border-accent rounded-full text-[9px] font-extrabold uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                      >
                        {discloseBulletin ? 'Close Assessment' : 'Disclose Assessment'}
                      </button>
                    </div>

                    {/* Bulletin disclosure drawer */}
                    <AnimatePresence>
                      {discloseBulletin && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-white/5 mt-4 pt-4 text-xs space-y-4 text-left"
                        >
                          <div className="grid sm:grid-cols-3 gap-4 bg-brand-light/40 p-4 rounded-2xl border border-white/5 font-mono text-[10px] text-white/50">
                            <div>
                              <p className="uppercase text-accent font-extrabold tracking-wider text-[8px] mb-1">Exposure Asset class</p>
                              <p className="font-bold text-white">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].commodity}</p>
                            </div>
                            <div>
                              <p className="uppercase text-accent font-extrabold tracking-wider text-[8px] mb-1">Systemic impact</p>
                              <p className="font-bold text-white">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].impact}</p>
                            </div>
                            <div>
                              <p className="uppercase text-accent font-extrabold tracking-wider text-[8px] mb-1">Strategic recommended response</p>
                              <p className="font-bold text-white">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].action}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-white/40 italic">
                            *Synthesized on sovereign secure networks and approved by Prashant Singh.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Advanced search filters */}
                  <div className="w-full flex flex-col md:flex-row gap-4 bg-brand-light/30 border border-white/5 p-4 rounded-2xl">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={newsSearchQuery}
                        onChange={(e) => setNewsSearchQuery(e.target.value)}
                        placeholder="Search raw intelligence stream..."
                        className="w-full bg-brand-light/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={newsSentimentFilter}
                        onChange={(e) => setNewsSentimentFilter(e.target.value)}
                        className="bg-brand-light/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                      >
                        <option value="All">All Sentiments</option>
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Negative">Negative</option>
                      </select>
                      <select
                        value={newsImpactFilter}
                        onChange={(e) => setNewsImpactFilter(e.target.value)}
                        className="bg-brand-light/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                      >
                        <option value="All">All Impacts</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Collapsible Briefcase Panel */}
                  <div className="w-full">
                    <button
                      onClick={() => setIsBriefcaseOpen(!isBriefcaseOpen)}
                      className="w-full flex items-center justify-between bg-accent/5 hover:bg-accent/10 border border-accent/20 hover:border-accent/40 rounded-2xl p-4 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <FolderHeart className="w-5 h-5 text-accent" />
                          {pinnedNews.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-brand text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                              {pinnedNews.length}
                            </span>
                          )}
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sovereign Briefcase Drawer</h4>
                          <p className="text-[10px] text-white/40">Compile pinned intelligence cards into a unified brief</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-white/40">
                          {isBriefcaseOpen ? 'COLLAPSE BRIEFCASE' : 'EXPAND BRIEFCASE'}
                        </span>
                        {isBriefcaseOpen ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4 text-accent" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isBriefcaseOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden bg-brand-light/40 border-x border-b border-white/5 rounded-b-2xl p-5 space-y-5 text-left"
                        >
                          {pinnedNews.length === 0 ? (
                            <div className="py-8 text-center text-white/30 text-xs italic border border-dashed border-white/10 rounded-xl">
                              No intelligence bookmarks pinned. Click the bookmark icon on any news card to add.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar">
                                {pinnedNews.map((p, idx) => (
                                  <div key={idx} className="bg-brand/50 border border-white/5 p-3 rounded-xl flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <span className="text-[8px] font-extrabold text-accent uppercase tracking-wider">{p.source}</span>
                                      <p className="text-[11px] font-bold text-white line-clamp-1">{p.title}</p>
                                    </div>
                                    <button
                                      onClick={() => setPinnedNews(pinnedNews.filter(item => item.title !== p.title))}
                                      className="text-white/30 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-3 pt-3 border-t border-white/5">
                                <button
                                  onClick={async () => {
                                    setSynthesizingBriefcase(true);
                                    try {
                                      const textList = pinnedNews.map(n => `- [${n.source}] ${n.title}: ${n.summary}`).join('\n');
                                      const response = await ai.models.generateContent({
                                        model: "gemini-3.5-flash",
                                        contents: `Perform an institutional cross-correlation and geopolitical exposure assessment on the following news dispatches for a sovereign wealth fund. Format with clear display headings. News items:\n${textList}`
                                      });
                                      setBriefcaseAnalysis(response.text || "Briefcase assessment successfully compiled.");
                                    } catch {
                                      setBriefcaseAnalysis("Error synthesizing briefing. Please check connection.");
                                    } finally {
                                      setSynthesizingBriefcase(false);
                                    }
                                  }}
                                  disabled={synthesizingBriefcase}
                                  className="w-full bg-accent hover:bg-accent-deep text-brand font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg hover:shadow-accent/10 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  {synthesizingBriefcase ? (
                                    <>
                                      <span className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                                      <span>Synthesizing Exposure Matrix...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4 text-brand" />
                                      <span>Synthesize Briefcase Portfolio</span>
                                    </>
                                  )}
                                </button>

                                {briefcaseAnalysis && (
                                  <div className="bg-brand/90 border border-white/10 rounded-2xl p-5 space-y-4 max-h-72 overflow-y-auto custom-scrollbar text-left">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">Sovereign Briefing Report</span>
                                      <button
                                        onClick={() => {
                                          const element = document.createElement("a");
                                          const file = new Blob([briefcaseAnalysis], {type: 'text/plain'});
                                          element.href = URL.createObjectURL(file);
                                          element.download = `Sovereign_Briefcase_Analysis_${new Date().toISOString().split('T')[0]}.txt`;
                                          document.body.appendChild(element);
                                          element.click();
                                          document.body.removeChild(element);
                                        }}
                                        className="text-[9px] font-bold text-white/50 hover:text-white uppercase tracking-wider cursor-pointer"
                                      >
                                        Download Brief (.txt)
                                      </button>
                                    </div>
                                    <div className="text-white/80 leading-relaxed text-xs space-y-3">
                                      {briefcaseAnalysis.split('\n').map((line, lidx) => (
                                        <p key={lidx} className="text-xs text-white/70 leading-relaxed mb-3">{line}</p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Featured Main Article */}
                  {filteredNewsletterNews.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="w-full relative aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 group cursor-pointer shadow-xl mb-6"
                      onClick={() => setSelectedResearchItem({
                        title: filteredNewsletterNews[0].title,
                        summary: filteredNewsletterNews[0].summary,
                        source: filteredNewsletterNews[0].source,
                        category: activeNewsTopic,
                        date: newsletterDate,
                        impact: filteredNewsletterNews[0].impact || "Medium",
                        sentiment: filteredNewsletterNews[0].sentiment || "Neutral",
                        content: "Raw diplomatic stream decrypt successfully complete. Sovereign nodes verified."
                      })}
                    >
                      <img
                        src="https://picsum.photos/seed/geopolitics/1200/600"
                        alt="Featured Intel"
                        className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/40 to-transparent" />
                      <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end items-center text-center">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-2.5 py-0.5 bg-accent text-brand rounded text-[8px] font-extrabold uppercase tracking-widest">Featured Dispatch</span>
                          <span className="text-[10px] font-mono text-white/40">{newsletterDate}</span>
                        </div>
                        <h3 className="text-xl lg:text-2xl font-bold max-w-2xl leading-tight group-hover:text-accent transition-colors">
                          {filteredNewsletterNews[0].title}
                        </h3>
                        {filteredNewsletterNews[0].url && (
                          <a
                            href={filteredNewsletterNews[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-accent/20 hover:bg-accent/45 border border-accent/30 text-accent hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Direct Source Feed ↗
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ) : null}

                  {/* Grid of news articles */}
                  <div className="w-full grid md:grid-cols-2 gap-6">
                    {loadingNewsletter ? (
                      <ToolSkeleton />
                    ) : filteredNewsletterNews.length > 0 ? (
                      filteredNewsletterNews.slice(1, 7).map((article, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          className="bg-brand/50 hover:bg-brand-light/30 border border-white/5 hover:border-white/10 rounded-2xl p-5 lg:p-6 shadow-md transition-all cursor-pointer group text-left relative"
                          onClick={() => setSelectedResearchItem({
                            title: article.title,
                            summary: article.summary,
                            source: article.source,
                            category: activeNewsTopic,
                            date: newsletterDate,
                            impact: article.impact || "Medium",
                            sentiment: article.sentiment || "Neutral",
                            content: "Raw diplomatic stream decrypt successfully complete. Sovereign nodes verified."
                          })}
                        >
                          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold text-accent uppercase tracking-widest">{article.source}</span>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider",
                                article.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' :
                                article.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'
                              )}>
                                {article.sentiment || 'Neutral'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {article.url && (
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-lg border border-white/5 bg-white/5 text-white/30 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer"
                                  title="Open live news reference"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPinnedNews(
                                    pinnedNews.some(item => item.title === article.title)
                                      ? pinnedNews.filter(item => item.title !== article.title)
                                      : [...pinnedNews, article]
                                  );
                                }}
                                className={cn(
                                  "p-2 rounded-lg border transition-all cursor-pointer",
                                  pinnedNews.some(item => item.title === article.title)
                                    ? "bg-accent/10 border-accent/35 text-accent"
                                    : "bg-white/5 border-white/5 text-white/30 hover:text-white hover:border-white/20"
                                )}
                              >
                                <Bookmark className={cn("w-3.5 h-3.5", pinnedNews.some(item => item.title === article.title) && "fill-accent text-accent")} />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-white/40 text-sm line-clamp-2 leading-relaxed">
                            {article.summary}
                          </p>
                          {article.url && (
                            <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-3 border-t border-white/5">
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-accent hover:text-white flex items-center gap-1 transition-colors"
                              >
                                View Direct Feed Source <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-white/20 italic border border-dashed border-white/10 rounded-2xl">
                        No articles match the selected filters.
                      </div>
                    )}
                  </div>
                  
                  <AIDispatchCompiler articles={filteredNewsletterNews} topic={activeNewsTopic} />
                </div>

                <NewsletterSubscription />
              </motion.div>
            )}

            {/* Tab: The Intelligence Hub */}
            {terminalTab === 'research' && (
              <motion.div
                key="research"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div id="research" className="bg-brand/30 border border-white/10 rounded-3xl p-8 shadow-2xl text-left">
                  <div className="mb-8 border-b border-white/5 pb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                      <Search className="w-3 h-3" />
                      Intelligence Story
                    </div>
                    <h3 className="text-2xl font-bold mb-4">The Intelligence Hub</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      "Data without context is just noise," Prashant often says. Our Research Hub is a synthesis of human expertise and machine learning that filters the global noise into actionable strategic signals. We don't just report on markets; we interpret their soul.
                    </p>
                  </div>

                  {/* Custom Tab selectors */}
                  <div className="flex flex-wrap gap-2 border-b border-white/5 pb-6 mb-8">
                    {[
                      { id: 'materials', label: t.research.tabs?.materials || 'Materials & Cement' },
                      { id: 'energy', label: t.research.tabs?.energy || 'Energy Transition' },
                      { id: 'shipping', label: t.research.tabs?.shipping || 'Freight & Shipping' },
                      { id: 'steel', label: 'Iron & Steel' },
                      { id: 'chemicals', label: 'Petrochemicals' },
                      { id: 'mining', label: 'Mining & Metals' },
                      { id: 'agribusiness', label: 'Fertilizers & Ag' },
                      { id: 'logistics', label: 'Supply Chain AI' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveResearchTab(tab.id as any);
                          setSectorSynthesis("");
                        }}
                        className={cn(
                          "px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
                          activeResearchTab === tab.id
                            ? "bg-accent text-brand shadow-lg font-black"
                            : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Sector Outlook Collapsible Panel */}
                  <AnimatePresence>
                    {showSectorSynthesisModal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 p-6 bg-accent/5 border border-accent/20 rounded-3xl overflow-hidden text-left"
                      >
                        <div className="flex items-center justify-between border-b border-accent/10 pb-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white">Sovereign Sector Macro-Outlook: {activeResearchTab.toUpperCase()}</h4>
                          </div>
                          <button
                            onClick={() => setShowSectorSynthesisModal(false)}
                            className="text-white/40 hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {synthesizingSector ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 animate-pulse">Assembling Sovereign Micro-Outlook Matrix...</span>
                            <span className="text-[8px] text-accent/50 font-mono mt-1">CROSS-CORRELATING REGIONAL DATA SOURCES...</span>
                          </div>
                        ) : sectorSynthesis ? (
                          <div className="space-y-4 text-left">
                            <div className="text-xs leading-relaxed text-white/80 whitespace-pre-line bg-brand-light/20 border border-white/5 rounded-xl p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                              {sectorSynthesis}
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  const element = document.createElement("a");
                                  const file = new Blob([sectorSynthesis], {type: 'text/plain'});
                                  element.href = URL.createObjectURL(file);
                                  element.download = `Sovereign_Sector_Outlook_${activeResearchTab}_${new Date().toISOString().split('T')[0]}.txt`;
                                  document.body.appendChild(element);
                                  element.click();
                                  document.body.removeChild(element);
                                }}
                                className="flex items-center gap-1.5 text-[9px] font-bold text-accent hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download Sector Outlook
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t.research.filters.source}</label>
                      <select 
                        value={researchSourceFilter}
                        onChange={(e) => setResearchSourceFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                      >
                        <option value="" className="bg-brand">{t.research.filters.allSources}</option>
                        {researchSources.map(source => (
                          <option key={source} value={source} className="bg-brand">{source}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t.research.filters.date}</label>
                      <select 
                        value={researchDateFilter}
                        onChange={(e) => setResearchDateFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                      >
                        <option value="" className="bg-brand">{t.research.filters.allDates}</option>
                        {researchDates.map(date => (
                          <option key={date} value={date} className="bg-brand">{date}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Research Visualizations */}
                  {!loadingResearch && researchChartData.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 grid md:grid-cols-2 gap-6"
                    >
                      {/* Bar Chart */}
                      <div className="bg-brand border border-white/5 p-6 rounded-2xl shadow-lg text-left">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-4">Production & Shipments Matrix</h4>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={researchChartData}>
                              <XAxis dataKey="metric" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10' }} />
                              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="projected" fill="var(--accent-deep)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Line Chart */}
                      <div className="bg-brand border border-white/5 p-6 rounded-2xl shadow-lg text-left">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-4">Macro Freight Index Forecast</h4>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={researchChartData}>
                              <XAxis dataKey="metric" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10' }} />
                              <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} activeDot={{ r: 6 }} />
                              <Line type="monotone" dataKey="projected" stroke="var(--accent-deep)" strokeWidth={1.5} strokeDasharray="3 3" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl mb-8">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Generate sovereign strategic macro outlook</span>
                    </div>
                    <button
                      onClick={async () => {
                        setShowSectorSynthesisModal(true);
                        setSynthesizingSector(true);
                        try {
                          const response = await ai.models.generateContent({
                            model: "gemini-3.5-flash",
                            contents: `Analyze macroeconomic exposures, supply elasticity, and price signals for the industrial sector: ${activeResearchTab}. Emphasize geopolitical friction and supply chain bottlenecks. Provide actionable risk mitigation strategies for multi-billion dollar private equity allocations. Audited by Prashant Singh.`
                          });
                          setSectorSynthesis(response.text || "Assessment completed successfully.");
                        } catch {
                          setSectorSynthesis("High API latency. Unable to compile sector analysis at this time.");
                        } finally {
                          setSynthesizingSector(false);
                        }
                      }}
                      className="w-full sm:w-auto bg-accent hover:bg-accent-deep text-brand font-black text-[9px] uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Synthesize {activeResearchTab.toUpperCase()} Outlook
                    </button>
                  </div>

                  {/* List of Research Reports */}
                  <div className="space-y-4">
                    {loadingResearch ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : filteredResearch.length > 0 ? (
                      filteredResearch.map((report, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          className="bg-brand/50 hover:bg-brand-light/40 border border-white/5 hover:border-accent/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group cursor-pointer text-left"
                          onClick={() => {
                            setSelectedResearchItem(report);
                          }}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest">{report.source}</span>
                              <span className="text-[8px] font-mono text-white/30">{report.date}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{report.title}</h4>
                            <p className="text-white/40 text-xs line-clamp-1">{report.summary}</p>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-wider",
                              report.impact === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                              report.impact === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/10' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                            )}>
                              IMPACT: {report.impact}
                            </span>
                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-white/20 italic border border-dashed border-white/10 rounded-xl">
                        {t.research.noReports || "No intelligence reports match filters."}
                      </div>
                    )}
                  </div>

                  {/* Actionable Live Visualizations */}
                  <div className="mt-12 pt-12 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/60">Live Intelligence & Network Visualizers</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="flex flex-col border border-white/5 bg-brand rounded-2xl overflow-hidden shadow-lg h-[400px]">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                          <div>
                            <span className="text-[9px] text-accent font-black uppercase tracking-widest font-mono">Prashant Singh MD</span>
                            <h3 className="text-xs font-bold text-white mt-1">Fleet & Logistics Tracking Platform</h3>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[8px] text-emerald-400 font-mono uppercase">Live</span>
                          </div>
                        </div>
                        <div className="flex-1 relative">
                          <FleetTrackingMap />
                        </div>
                      </div>

                      <div className="flex flex-col border border-white/5 bg-brand rounded-2xl overflow-hidden shadow-lg h-[400px]">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                          <div>
                            <span className="text-[9px] text-accent font-black uppercase tracking-widest font-mono">Astraeus Predictive AI</span>
                            <h3 className="text-xs font-bold text-white mt-1">Structural Global Cement Shortages 2026</h3>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[8px] text-red-400 font-mono uppercase">Alert</span>
                          </div>
                        </div>
                        <div className="flex-1 relative">
                          <CementShortageChart />
                        </div>
                      </div>

                      <div className="flex flex-col border border-white/5 bg-brand rounded-2xl overflow-hidden shadow-lg h-[400px]">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                          <div>
                            <span className="text-[9px] text-accent font-black uppercase tracking-widest font-mono">Sovereign Supply Network</span>
                            <h3 className="text-xs font-bold text-white mt-1">Singapore Transshipment Bottleneck</h3>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="text-[8px] text-yellow-400 font-mono uppercase">Warning</span>
                          </div>
                        </div>
                        <div className="flex-1 relative">
                          <SingaporeBottleneckMap />
                        </div>
                      </div>

                      <div className="flex flex-col border border-white/5 bg-brand rounded-2xl overflow-hidden shadow-lg h-[400px]">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                          <div>
                            <span className="text-[9px] text-accent font-black uppercase tracking-widest font-mono">Storage Intelligence Node</span>
                            <h3 className="text-xs font-bold text-white mt-1">Warehouse Raw Material Status</h3>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[8px] text-emerald-400 font-mono uppercase">Live</span>
                          </div>
                        </div>
                        <div className="flex-1 relative">
                          <WarehouseGrid />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* Tab: Materials */}
            {terminalTab === 'materials' && (
              <motion.div
                key="materials"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 text-left">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                      <Building2 className="w-3 h-3" />
                      Sector Story
                    </div>
                    <h2 className="text-4xl font-bold mb-4 tracking-tight">The Future of Foundations</h2>
                    <p className="text-white/50">
                      Prashant's vision for building materials goes beyond supply chains. It's about the "Molecular Revolution"—transforming how we perceive the very atoms of our infrastructure. We don't just track cement; we track the evolution of human shelter.
                    </p>
                  </div>
                  <button className="flex items-center gap-2 text-accent font-bold hover:gap-4 transition-all cursor-pointer">
                    Explore the Narrative <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
                  {[
                    { name: 'Self-Healing Concrete', source: 'ETH Zurich', img: 'https://picsum.photos/seed/concrete/800/600' },
                    { name: 'Aerogel Insulation', source: 'NASA Spinoff', img: 'https://picsum.photos/seed/aerogel/800/600' },
                    { name: 'Transparent Wood', source: 'KTH Royal Institute', img: 'https://picsum.photos/seed/wood/800/600' },
                    { name: 'Graphene Steel', source: 'Manchester Graphene', img: 'https://picsum.photos/seed/graphene/800/600' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -10 }}
                      className="relative group overflow-hidden rounded-2xl aspect-[3/4] shadow-xl"
                    >
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6">
                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Source: {item.source}</p>
                        <h4 className="text-lg font-bold leading-tight">{item.name}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tab: Energy */}
            {terminalTab === 'energy' && (
              <motion.div
                key="energy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="grid lg:grid-cols-2 gap-16 items-start text-left">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
                      <Zap className="w-3 h-3" />
                      Energy Narrative
                    </div>
                    <h2 className="text-4xl font-bold mb-6 tracking-tight">Powering the Transition</h2>
                    <p className="text-white/60 mb-8 leading-relaxed">
                      "Energy is the lifeblood of civilization, but its current form is unsustainable," Prashant notes. Our energy story is one of transition—moving from extraction to optimization. We help legacy giants navigate the turbulent waters of decarbonization while ensuring global stability.
                    </p>
                    <div className="space-y-8">
                      {[
                        { label: 'Renewable Integration', value: 34, color: 'bg-accent' },
                        { label: 'Fossil Fuel Decoupling', value: 18, color: 'bg-accent-deep' },
                        { label: 'Grid Modernization', value: 56, color: 'bg-yellow-500' },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-white/70">{item.label}</span>
                            <span className="text-sm font-bold">{item.value}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.value}%` }}
                              transition={{ duration: 1, delay: i * 0.2 }}
                              className={cn("h-full rounded-full", item.color)} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-12 text-white/40 text-sm italic">
                      *Data aggregated from International Energy Agency (IEA) and BloombergNEF. 
                      Updated daily at 00:00 GMT.
                    </p>
                  </div>

                  {/* Right Column: Custom Interactive Energy Transition Visualization Card */}
                  <div className="bg-brand border border-white/5 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold font-display tracking-tight text-white">Sovereign Grid Transition Model</h3>
                        <p className="text-xs text-white/40">Clean vs. Legacy Generation Decoupling Curve</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-bold text-lg">+12.4%</span>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest">YTD Renewables Growth</p>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { year: '2020', clean: 20, fossil: 80 },
                          { year: '2021', clean: 24, fossil: 76 },
                          { year: '2022', clean: 28, fossil: 72 },
                          { year: '2023', clean: 31, fossil: 69 },
                          { year: '2024', clean: 34, fossil: 66 },
                          { year: '2025', clean: 38, fossil: 62 },
                          { year: '2026', clean: 42, fossil: 58 },
                        ]}>
                          <defs>
                            <linearGradient id="colorClean" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFossil" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: 'var(--accent)' }}
                          />
                          <Area type="monotone" dataKey="clean" name="Renewable Power" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorClean)" />
                          <Area type="monotone" dataKey="fossil" name="Fossil Base" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorFossil)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase mb-1 tracking-wider">Carbon Offsetting</p>
                        <p className="font-mono font-semibold text-xs text-emerald-400">42,500 Mt CO2e / yr</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/40 uppercase mb-1 tracking-wider">ESG Rating</p>
                        <p className="font-mono font-semibold text-xs text-accent">Sovereign Grade A+</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </section>
  );
};
