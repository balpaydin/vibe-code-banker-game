
import React, { useState } from 'react';
import { Rebellion } from '../types';
import { Flame, AlertOctagon, Coins, ShieldAlert, Crown, Hourglass, Percent } from 'lucide-react';

interface RebellionCardProps {
  rebellion: Rebellion;
  hasAsset: boolean;
  playerGold: number;
  onSupport: (id: string, amount: number, side: 'rebels' | 'crown') => void;
}

const RebellionCard: React.FC<RebellionCardProps> = ({ rebellion, hasAsset, playerGold, onSupport }) => {
  const [amount, setAmount] = useState(1000);
  const MAX_DURATION = 5;

  return (
    <div className="bg-stone-900 border border-red-900/50 rounded overflow-hidden shadow-lg relative">
       {/* Header */}
       <div className="bg-red-950/30 p-3 border-b border-red-900/30 flex items-center justify-between">
          <span className="text-red-400 font-bold text-sm flex items-center gap-2">
             <Flame size={16} /> {rebellion.kingdom} İsyanı
          </span>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded border border-red-900/30" title="Başarı Şansı">
               <Percent size={12} className="text-stone-400" />
               <span className={`text-[10px] font-mono font-bold ${rebellion.strength > 50 ? 'text-red-400' : 'text-stone-300'}`}>%{rebellion.strength.toFixed(0)}</span>
             </div>
             <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded border border-red-900/30" title="Kalan Süre">
               <Hourglass size={12} className="text-stone-400" />
               <span className="text-[10px] font-mono text-stone-300">{rebellion.duration}/{MAX_DURATION}</span>
             </div>
          </div>
       </div>

       <div className="p-4">
          {hasAsset ? (
             <div className="space-y-3">
                <div className="bg-red-900/20 border border-red-800 p-3 rounded text-center">
                   <AlertOctagon className="mx-auto text-red-500 mb-2" size={24} />
                   <p className="text-sm text-red-200 font-bold mb-1">Mülkleriniz Tehlikede!</p>
                   <p className="text-xs text-stone-400 mb-2">
                      İsyan başarılı olursa mülkleriniz yağmalanacak. Krala yardım göndererek düzeni koruyabilirsiniz.
                   </p>
                </div>
                
                {/* Support Crown Option */}
                <div className="bg-stone-800 p-2 rounded border border-amber-900/50">
                   <p className="text-[10px] text-stone-400 mb-2 font-bold uppercase">Kraliyet Ordusunu Destekle</p>
                   <div className="flex gap-2">
                     <select 
                        value={amount} 
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-stone-900 text-xs text-stone-200 p-1 border border-stone-700 rounded outline-none flex-1"
                     >
                        <option value={1000}>1000 Florin</option>
                        <option value={2000}>2000 Florin</option>
                        <option value={5000}>5000 Florin</option>
                     </select>
                     <button 
                        disabled={playerGold < amount}
                        onClick={() => onSupport(rebellion.id, amount, 'crown')}
                        className="bg-amber-800 hover:bg-amber-700 text-amber-100 text-xs px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                     >
                        <Crown size={12} /> Kral'a Gönder
                     </button>
                   </div>
                </div>
             </div>
          ) : (
             <div>
                <div className="bg-stone-800 p-3 rounded mb-3 text-center border border-stone-700">
                   <p className="text-xs text-stone-300 mb-2">
                      Bu krallıkta kaybedecek bir şeyiniz yok. Asilere yardım ederek yeni yönetimden imtiyaz koparabilirsiniz.
                   </p>
                   <div className="flex items-center justify-between gap-2 bg-stone-900 p-1 rounded border border-stone-600">
                      <select 
                        value={amount} 
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-transparent text-xs text-stone-200 p-1 outline-none w-full"
                      >
                         <option value={1000}>1000 Florin</option>
                         <option value={2000}>2000 Florin</option>
                         <option value={5000}>5000 Florin</option>
                      </select>
                      <button 
                        disabled={playerGold < amount}
                        onClick={() => onSupport(rebellion.id, amount, 'rebels')}
                        className="bg-red-800 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
                      >
                         <Coins size={12} /> Asilere Gönder
                      </button>
                   </div>
                </div>
             </div>
          )}

          {rebellion.playerInvestment > 0 && (
             <p className={`mt-2 text-[10px] text-center flex items-center justify-center gap-1 font-bold ${rebellion.supportSide === 'crown' ? 'text-amber-400' : 'text-red-400'}`}>
                <ShieldAlert size={10} /> 
                {rebellion.supportSide === 'crown' ? 'Krala Desteğiniz:' : 'Asilere Desteğiniz:'} {rebellion.playerInvestment} F
             </p>
          )}
       </div>
    </div>
  );
};

export default RebellionCard;
