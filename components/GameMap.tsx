
import React from 'react';
import { Kingdom, War, Workshop, KingdomType, AssetType, Competitor } from '../types';
import { Swords, Home, Anvil, Pickaxe, Wheat, Landmark, Anchor, Mountain, Crown, TreePine, Tent, CloudSnow, Droplets, Shield } from 'lucide-react';

interface GameMapProps {
  kingdoms: Kingdom[];
  wars: War[];
  workshops: Workshop[];
  competitors: Competitor[];
  onSelectKingdom: (kingdomId: string) => void;
}

const KINGDOM_POSITIONS: Record<KingdomType, { x: number; y: number; icon: React.ReactNode }> = {
  [KingdomType.NORTH]: { x: 50, y: 10, icon: <Crown size={16} /> },
  [KingdomType.SOUTH]: { x: 50, y: 90, icon: <Home size={16} /> },
  [KingdomType.EAST]: { x: 90, y: 50, icon: <Home size={16} /> },
  [KingdomType.WEST]: { x: 10, y: 50, icon: <Home size={16} /> },
  [KingdomType.HIGHLAND]: { x: 30, y: 30, icon: <Mountain size={16} /> },
  [KingdomType.ISLAND]: { x: 85, y: 85, icon: <Anchor size={16} /> },
  [KingdomType.VALLEY]: { x: 30, y: 70, icon: <TreePine size={16} /> },
  [KingdomType.RIVER]: { x: 60, y: 60, icon: <Droplets size={16} /> },
  [KingdomType.DESERT]: { x: 70, y: 80, icon: <Tent size={16} /> },
  [KingdomType.ICE]: { x: 70, y: 10, icon: <CloudSnow size={16} /> },
  [KingdomType.FOREST]: { x: 20, y: 40, icon: <TreePine size={16} /> },
  [KingdomType.SWAMP]: { x: 80, y: 70, icon: <Droplets size={16} /> },
  [KingdomType.IRON]: { x: 15, y: 20, icon: <Mountain size={16} /> },
  [KingdomType.GOLD]: { x: 90, y: 30, icon: <Anchor size={16} /> },
  [KingdomType.STORM]: { x: 10, y: 80, icon: <CloudSnow size={16} /> },
  [KingdomType.CRYSTAL]: { x: 40, y: 50, icon: <Home size={16} /> },
  [KingdomType.VOLCANO]: { x: 20, y: 90, icon: <Mountain size={16} /> },
  [KingdomType.STEPPE]: { x: 80, y: 20, icon: <Tent size={16} /> },
  [KingdomType.SECRET]: { x: 50, y: 40, icon: <Shield size={16} /> },
  [KingdomType.TRADE]: { x: 60, y: 30, icon: <Landmark size={16} /> },
};

// Simplified paths for visual representation
const REGION_PATHS: Record<KingdomType, string> = {
  [KingdomType.NORTH]: "M 30 5 Q 50 0 70 5 L 60 20 L 40 20 Z",
  [KingdomType.SOUTH]: "M 30 95 Q 50 100 70 95 L 60 80 L 40 80 Z",
  [KingdomType.EAST]: "M 95 30 Q 100 50 95 70 L 80 60 L 80 40 Z",
  [KingdomType.WEST]: "M 5 30 Q 0 50 5 70 L 20 60 L 20 40 Z",
  [KingdomType.HIGHLAND]: "M 25 25 L 35 25 L 30 35 Z",
  [KingdomType.ISLAND]: "M 80 80 L 90 80 L 90 90 L 80 90 Z",
  [KingdomType.VALLEY]: "M 25 65 L 35 65 L 35 75 L 25 75 Z",
  [KingdomType.RIVER]: "M 55 55 L 65 55 L 65 65 L 55 65 Z",
  [KingdomType.DESERT]: "M 65 75 L 75 75 L 75 85 L 65 85 Z",
  [KingdomType.ICE]: "M 65 5 L 75 5 L 75 15 L 65 15 Z",
  [KingdomType.FOREST]: "M 15 35 L 25 35 L 25 45 L 15 45 Z",
  [KingdomType.SWAMP]: "M 75 65 L 85 65 L 85 75 L 75 75 Z",
  [KingdomType.IRON]: "M 10 15 L 20 15 L 20 25 L 10 25 Z",
  [KingdomType.GOLD]: "M 85 25 L 95 25 L 95 35 L 85 35 Z",
  [KingdomType.STORM]: "M 5 75 L 15 75 L 15 85 L 5 85 Z",
  [KingdomType.CRYSTAL]: "M 35 45 L 45 45 L 45 55 L 35 55 Z",
  [KingdomType.VOLCANO]: "M 15 85 L 25 85 L 25 95 L 15 95 Z",
  [KingdomType.STEPPE]: "M 75 15 L 85 15 L 85 25 L 75 25 Z",
  [KingdomType.SECRET]: "M 45 35 L 55 35 L 55 45 L 45 45 Z",
  [KingdomType.TRADE]: "M 55 25 L 65 25 L 65 35 L 55 35 Z",
};

const GameMap: React.FC<GameMapProps> = ({ kingdoms, wars, workshops, competitors, onSelectKingdom }) => {
  
  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.FARM: return <Wheat size={8} />;
      case AssetType.MINE: return <Pickaxe size={8} />;
      case AssetType.WEAPONSMITH: return <Anvil size={8} />;
      case AssetType.BANK: return <Landmark size={8} />;
    }
  };

  return (
    <div className="relative w-full h-full bg-stone-900 overflow-hidden rounded-lg shadow-2xl border border-stone-800 select-none">
      <div className="absolute inset-0 opacity-50 pointer-events-none bg-gradient-to-br from-slate-900 via-[#0a1016] to-black"></div>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 50%, #000 150%)' }}></div>
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="10,10" />
      </svg>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
           <pattern id="land-texture" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 5 5 M 10 0 L 5 5" stroke="#3a3530" strokeWidth="0.2" fill="none"/>
          </pattern>
        </defs>
        {Object.entries(REGION_PATHS).map(([type, path]) => {
           const isAtWar = wars.some(w => !w.resolved && (w.attacker.name === type || w.defender.name === type));
           return (
             <g key={type}>
               <path d={path} fill="#292524" stroke={isAtWar ? "#7f1d1d" : "#44403c"} strokeWidth={isAtWar ? "0.8" : "0.5"} className={`${isAtWar ? 'animate-pulse' : ''} hover:fill-[#35312e] transition-colors duration-300`} />
               <path d={path} fill="url(#land-texture)" opacity="0.5" pointerEvents="none" />
             </g>
           );
        })}
        {wars.filter(w => !w.resolved).map(war => {
           const start = KINGDOM_POSITIONS[war.attacker.name];
           const end = KINGDOM_POSITIONS[war.defender.name];
           if (!start || !end) return null;
           const midX = (start.x + end.x) / 2;
           const midY = (start.y + end.y) / 2;
           const controlX = 50 + (midX - 50) * 0.5; 
           const controlY = 50 + (midY - 50) * 0.5;
           return (
             <path key={war.id} d={`M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`} fill="none" stroke="#b91c1c" strokeWidth="0.6" strokeDasharray="2,2" className="animate-[dash_2s_linear_infinite]">
               <animate attributeName="stroke-dashoffset" from="40" to="0" dur="2s" repeatCount="indefinite" />
             </path>
           );
        })}
      </svg>

      {kingdoms.map(k => {
        const pos = KINGDOM_POSITIONS[k.name];
        const playerAssets = workshops.filter(w => w.kingdomName === k.name);
        const rivalAssets = competitors.flatMap(c => c.workshops.filter(w => w.kingdomName === k.name).map(w => ({ ...w, ownerColor: c.color, ownerName: c.name })));
        const isAtWar = wars.some(w => !w.resolved && (w.attacker.name === k.name || w.defender.name === k.name));

        return (
          <div key={k.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onClick={() => onSelectKingdom(k.id)}>
            <div className="relative flex flex-col items-center justify-center">
               {isAtWar && (<div className="absolute -top-4 text-red-500 animate-bounce drop-shadow-md"><Swords size={16} fill="currentColor" /></div>)}
               <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center shadow-lg bg-stone-900/90 backdrop-blur-sm transition-colors ${isAtWar ? 'border-red-500' : 'border-stone-500 hover:border-amber-500'}`}>
                  <div className={`text-stone-300 ${isAtWar ? 'text-red-400' : ''}`}>{pos.icon}</div>
               </div>
               <span className="mt-1 px-1.5 py-0.5 bg-black/70 border border-stone-700/50 rounded text-[8px] font-bold text-stone-300 whitespace-nowrap backdrop-blur-sm">{k.name}</span>
               <div className="absolute -right-4 top-0 flex flex-col gap-0.5">
                  {playerAssets.map(asset => (<div key={asset.id} className="bg-stone-800 p-0.5 rounded-full border border-amber-500 text-amber-500 shadow-sm">{getAssetIcon(asset.type)}</div>))}
                  {rivalAssets.map(asset => (<div key={asset.id} className={`bg-stone-800 p-0.5 rounded-full border text-stone-400 shadow-sm ${asset.ownerColor ? asset.ownerColor.replace('text-', 'border-') : 'border-stone-500'}`}>{getAssetIcon(asset.type)}</div>))}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameMap;
