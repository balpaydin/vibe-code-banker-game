
import React, { useState } from 'react';
import { War } from '../types';
import { Swords, Shield, Coins, Hammer, Lock, Globe2, Scale, TrendingUp } from 'lucide-react';

interface WarCardProps {
  war: War;
  playerGold: number;
  playerWeapons: number;
  hasPresenceInAttacker: boolean;
  hasPresenceInDefender: boolean;
  onSupport: (warId: string, side: 'attacker' | 'defender', amount: number, type: 'gold' | 'weapons') => void;
}

const WarCard: React.FC<WarCardProps> = ({ 
  war, 
  playerGold, 
  playerWeapons, 
  hasPresenceInAttacker,
  hasPresenceInDefender,
  onSupport 
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [weaponQty, setWeaponQty] = useState<number>(50);
  
  const MAX_ROUNDS = 4;
  const GOAL_STRENGTH = 90;

  // Conflict of Interest Check
  const isConflictOfInterest = hasPresenceInAttacker && hasPresenceInDefender;

  // Dynamic Price Calculation
  const getPricePerWeapon = (strength: number) => {
     return Math.floor(20 * (1 + (100 - strength) / 100));
  };

  const attackerWeaponPrice = getPricePerWeapon(war.attackerStrength);
  const defenderWeaponPrice = getPricePerWeapon(war.defenderStrength);

  const handleSupport = (side: 'attacker' | 'defender', type: 'gold' | 'weapons') => {
    if (isConflictOfInterest) return;

    if (type === 'gold' && playerGold >= amount) {
      onSupport(war.id, side, amount, type);
    } else if (type === 'weapons' && playerWeapons >= weaponQty) {
      onSupport(war.id, side, weaponQty, type);
    }
  };

  const renderActionButtons = (side: 'attacker' | 'defender', hasPresence: boolean, price: number) => {
    const isLocked = !hasPresence || isConflictOfInterest;
    
    return (
      <div className={`flex flex-col gap-2 mt-2 w-full ${isLocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {/* Weapon Sell Button */}
        <button
          onClick={() => handleSupport(side, 'weapons')}
          disabled={playerWeapons < weaponQty}
          className="flex items-center justify-between bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded px-2 py-1.5 transition-colors group"
          title={`Silah Sat: ${weaponQty} adet`}
        >
           <div className="flex items-center gap-1.5">
              <Hammer size={12} className="text-stone-400 group-hover:text-stone-200" />
              <span className="text-[10px] font-bold text-stone-300">Sat</span>
           </div>
           <span className="text-[10px] text-green-400 font-bold">+{weaponQty * price}F</span>
        </button>

        {/* Gold Donate Button */}
        <button
          onClick={() => handleSupport(side, 'gold')}
          disabled={playerGold < amount}
          className="flex items-center justify-between bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded px-2 py-1.5 transition-colors group"
          title={`Hibe Et: ${amount} Florin`}
        >
           <div className="flex items-center gap-1.5">
              <Coins size={12} className="text-amber-600 group-hover:text-amber-500" />
              <span className="text-[10px] font-bold text-stone-300">Hibe</span>
           </div>
           <span className="text-[10px] text-red-400">-{amount}F</span>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg overflow-hidden shadow-xl flex flex-col h-full">
      {/* Compact Header */}
      <div className="bg-stone-950 px-3 py-2 border-b border-stone-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${war.resolved ? 'bg-gray-500' : 'bg-red-500 animate-pulse'}`}></div>
          <span className="text-xs font-bold text-stone-300 uppercase tracking-wider truncate max-w-[150px]">{war.description}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
          Tur {war.round}/{MAX_ROUNDS}
        </span>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-center">
        
        {/* Conflict Warning */}
        {isConflictOfInterest && (
           <div className="mb-2 bg-amber-900/10 border border-amber-800/50 px-2 py-1 rounded flex items-center justify-center gap-2 text-amber-500">
              <Scale size={12} />
              <span className="text-[10px] font-bold uppercase">Çıkar Çatışması - Tarafsız Kalın</span>
           </div>
        )}

        <div className="flex gap-2 h-full">
          {/* LEFT: ATTACKER */}
          <div className="w-1/3 flex flex-col items-center bg-red-950/10 rounded p-2 border border-red-900/20">
             <div className="relative mb-1">
                <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-red-900/50 shadow-sm">
                  <Swords className="text-red-500" size={18} />
                </div>
                {!hasPresenceInAttacker && (
                   <div className="absolute -top-1 -right-1 bg-stone-950 text-stone-500 p-0.5 rounded-full border border-stone-700 z-10">
                     <Lock size={10} />
                   </div>
                )}
             </div>
             <h3 className="font-bold text-stone-300 text-[10px] text-center leading-tight h-6 flex items-center">{war.attacker.name}</h3>
             <div className="text-[9px] text-stone-500 mb-2">Güç: <span className="text-stone-300">{war.attackerStrength.toFixed(0)}</span></div>
             
             {/* Action Buttons (Left) */}
             {renderActionButtons('attacker', hasPresenceInAttacker, attackerWeaponPrice)}
          </div>

          {/* CENTER: INFO & SETTINGS */}
          <div className="flex-1 flex flex-col gap-2">
             
             {/* Progress Bar */}
             <div className="relative h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-700 w-full shrink-0">
                <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-900 to-red-600 transition-all duration-700" style={{ width: `${(war.attackerStrength / 100) * 100}%` }}></div>
                <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-blue-900 to-blue-600 transition-all duration-700" style={{ width: `${(war.defenderStrength / 100) * 100}%` }}></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10"></div>
             </div>

             {/* Settings Row */}
             <div className="bg-stone-800/50 rounded p-1.5 border border-stone-700/50 flex flex-col gap-1.5 shrink-0">
                <div className="flex items-center justify-between text-[9px]">
                   <span className="text-stone-500 uppercase font-bold">Miktar Ayarı</span>
                </div>
                <div className="flex gap-1">
                   <select 
                      value={weaponQty}
                      onChange={(e) => setWeaponQty(Number(e.target.value))}
                      className="bg-stone-900 text-[10px] text-stone-300 p-1 border border-stone-700 rounded w-1/2 outline-none focus:border-amber-600"
                   >
                      <option value={50}>50 Silah</option>
                      <option value={100}>100 Silah</option>
                      <option value={250}>250 Silah</option>
                   </select>
                   <select 
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="bg-stone-900 text-[10px] text-amber-200 p-1 border border-stone-700 rounded w-1/2 outline-none focus:border-amber-600"
                   >
                      <option value={500}>500 F</option>
                      <option value={1000}>1K F</option>
                      <option value={5000}>5K F</option>
                   </select>
                </div>
             </div>

             {/* Interventions Log */}
             <div className="flex-1 bg-stone-950/50 rounded border border-stone-800 p-1.5 overflow-y-auto min-h-[40px] scrollbar-thin">
                <div className="flex items-center gap-1 mb-1 border-b border-stone-800 pb-0.5">
                   <Globe2 size={8} className="text-stone-500" />
                   <span className="text-[9px] font-bold text-stone-500 uppercase">Dış Müdahale</span>
                </div>
                {war.competitorLog && war.competitorLog.length > 0 ? (
                   <div className="space-y-0.5">
                      {war.competitorLog.map((log, i) => (
                         <div key={i} className="flex justify-between items-center text-[9px] leading-tight">
                            <span className="text-stone-400 truncate max-w-[60px]">{log.competitorName}</span>
                            <div className="flex items-center gap-1">
                               <span className={log.side === 'attacker' ? 'text-red-500' : 'text-blue-500'}>
                                  {log.side === 'attacker' ? 'Sald.' : 'Sav.'}
                               </span>
                               <span className="text-amber-600">{log.amount}</span>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div className="text-[9px] text-stone-600 italic text-center mt-1">Henüz müdahale yok.</div>
                )}
             </div>

          </div>

          {/* RIGHT: DEFENDER */}
          <div className="w-1/3 flex flex-col items-center bg-blue-950/10 rounded p-2 border border-blue-900/20">
             <div className="relative mb-1">
                <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-blue-900/50 shadow-sm">
                  <Shield className="text-blue-500" size={18} />
                </div>
                {!hasPresenceInDefender && (
                   <div className="absolute -top-1 -right-1 bg-stone-950 text-stone-500 p-0.5 rounded-full border border-stone-700 z-10">
                     <Lock size={10} />
                   </div>
                )}
             </div>
             <h3 className="font-bold text-stone-300 text-[10px] text-center leading-tight h-6 flex items-center">{war.defender.name}</h3>
             <div className="text-[9px] text-stone-500 mb-2">Güç: <span className="text-stone-300">{war.defenderStrength.toFixed(0)}</span></div>

             {/* Action Buttons (Right) */}
             {renderActionButtons('defender', hasPresenceInDefender, defenderWeaponPrice)}
          </div>

        </div>
      </div>
    </div>
  );
};

export default WarCard;
