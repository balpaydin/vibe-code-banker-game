
import React, { useState } from 'react';
import { Workshop, KingdomType, AssetType, Embargo, Loan, Competitor, Agent, LoanRequest, ResourceType, MarketItem } from '../types';
import { Coins, Building2, Hammer, Plus, Anvil, Wheat, Pickaxe, Landmark, Ban, Handshake, Skull, ShieldCheck, Users, TrendingUp, Store, ArrowUpRight, ArrowDownRight, Minus, UserPlus, Sword, XCircle, CheckCircle, DollarSign, X, FlaskRound } from 'lucide-react';

interface PortfolioProps {
  gold: number;
  weapons: number;
  grain: number;
  medicine: number;
  reputation: number;
  workshops: Workshop[];
  embargoes: Embargo[];
  loans: Loan[];
  loanRequests: LoanRequest[];
  agents: Agent[];
  competitors: Competitor[];
  market: Record<ResourceType, MarketItem>;
  wars: any[];
  turn: number;
  onEndTurn: () => void;
  onBuildAsset: (kingdomName: KingdomType, type: AssetType) => void;
  onSellAsset: (assetId: string) => void;
  onHireAgent: () => void;
  onFireAgent: (agentId: string) => void;
  onAcceptLoan: (requestId: string) => void;
  onRejectLoan: (requestId: string) => void;
  onCollectDebt: (loanId: string, agentId: string) => void;
  onMarketTrade: (resource: ResourceType, action: 'buy' | 'sell', amount: number) => void;
  isThinking: boolean;
  onClose?: () => void; 
}

const ASSET_COSTS: Record<AssetType, number> = {
  [AssetType.FARM]: 2000,
  [AssetType.WEAPONSMITH]: 4000,
  [AssetType.APOTHECARY]: 5500,
  [AssetType.MINE]: 7500,
  [AssetType.BANK]: 15000
};

const Portfolio: React.FC<PortfolioProps> = ({ 
  gold, 
  weapons,
  grain,
  medicine, 
  workshops, 
  embargoes,
  loans,
  loanRequests,
  agents,
  competitors,
  market,
  wars,
  turn, 
  onEndTurn, 
  onBuildAsset,
  onSellAsset,
  onHireAgent,
  onFireAgent,
  onAcceptLoan,
  onRejectLoan,
  onCollectDebt,
  onMarketTrade,
  isThinking,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'finance' | 'rivals' | 'market'>('assets');
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(AssetType.FARM);
  const [tradeAmount, setTradeAmount] = useState<number>(100);

  const isKingdomUnderSiege = (kingdomName: KingdomType) => {
     return wars.some(w => !w.resolved && w.defender.name === kingdomName);
  };

  const totalAssetIncome = workshops.reduce((acc, w) => {
    if (isKingdomUnderSiege(w.kingdomName)) return acc;
    return acc + w.goldIncome;
  }, 0);

  const totalAgentCost = agents.reduce((acc, a) => acc + a.costPerTurn, 0);
  const totalMaintenance = workshops.reduce((acc, w) => acc + w.maintenance, 0) + totalAgentCost;
  
  const getNetWorth = (gold: number, assets: Workshop[]) => {
    return gold + assets.reduce((sum, asset) => sum + (ASSET_COSTS[asset.type] * 0.8), 0);
  };

  const playerNetWorth = getNetWorth(gold, workshops);
  const allBankers = [
    { id: 'player', name: 'Siz', gold, workshops, netWorth: playerNetWorth, color: 'text-amber-400' },
    ...competitors.map(c => ({ ...c, netWorth: getNetWorth(c.gold, c.workshops), color: 'text-stone-300' }))
  ].sort((a, b) => b.netWorth - a.netWorth);

  const getAssetIcon = (type: AssetType, size: number = 14) => {
    switch (type) {
      case AssetType.FARM: return <Wheat size={size} />;
      case AssetType.MINE: return <Pickaxe size={size} />;
      case AssetType.WEAPONSMITH: return <Anvil size={size} />;
      case AssetType.APOTHECARY: return <FlaskRound size={size} />;
      case AssetType.BANK: return <Landmark size={size} />;
    }
  };

  const isEmbargoed = (kingdomName: KingdomType) => {
    return embargoes.some(e => e.kingdom === kingdomName && e.untilTurn > turn);
  };

  const activeLoans = loans.filter(l => l.status !== 'paid' && l.status !== 'collected' && l.status !== 'lost');

  return (
    <div className="bg-stone-900 border-r border-stone-700 w-full h-full flex flex-col overflow-hidden z-20 shadow-2xl">
      {/* Header Stats */}
      <div className="p-6 border-b border-stone-700 bg-stone-800 relative">
        {onClose && (
           <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-stone-300 md:hidden">
              <X size={24} />
           </button>
        )}
        <h2 className="text-2xl medieval-font text-amber-500 mb-4">Banker'in Masası</h2>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-stone-900/50 p-1.5 rounded border border-stone-700">
             <span className="text-stone-400 flex items-center gap-1 text-[10px] uppercase mb-1"><Coins size={12} /> Hazine</span>
             <span className="text-sm font-bold text-amber-300">{gold.toLocaleString()}</span>
          </div>
          
          <div className="bg-stone-900/50 p-1.5 rounded border border-stone-700">
             <span className="text-stone-400 flex items-center gap-1 text-[10px] uppercase mb-1"><Hammer size={12} /> Silah</span>
             <span className="text-sm font-bold text-stone-300">{weapons.toLocaleString()}</span>
          </div>

          <div className="bg-stone-900/50 p-1.5 rounded border border-stone-700">
             <span className="text-stone-400 flex items-center gap-1 text-[10px] uppercase mb-1"><Wheat size={12} /> Tahıl</span>
             <span className="text-sm font-bold text-yellow-200">{grain.toLocaleString()}</span>
          </div>

          <div className="bg-stone-900/50 p-1.5 rounded border border-stone-700">
             <span className="text-stone-400 flex items-center gap-1 text-[10px] uppercase mb-1"><FlaskRound size={12} /> İlaç</span>
             <span className="text-sm font-bold text-blue-200">{medicine.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-2"><Building2 size={16} /> Net Gelir</span>
            <span className={totalAssetIncome - totalMaintenance >= 0 ? "text-green-400" : "text-red-400"}>
              {totalAssetIncome - totalMaintenance > 0 ? '+' : ''}{totalAssetIncome - totalMaintenance} / Yıl
            </span>
          </div>

           <div className="flex items-center justify-between pt-2 border-t border-stone-700 mt-2">
            <span className="text-stone-400">Yıl (Tur)</span>
            <span className="text-lg font-bold">{1200 + turn}</span>
          </div>
        </div>

        <button
          onClick={() => {
            onEndTurn();
            if (onClose) onClose(); 
          }}
          disabled={isThinking}
          className={`mt-6 w-full py-3 px-4 rounded border border-amber-700 font-bold uppercase tracking-wider transition-all
            ${isThinking 
              ? 'bg-stone-700 text-stone-500 cursor-not-allowed' 
              : 'bg-amber-900 text-amber-100 hover:bg-amber-800 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            }`}
        >
          {isThinking ? 'Dünya Dönüyor...' : 'Yılı Bitir'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-700 bg-stone-900">
        <button onClick={() => setActiveTab('assets')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'assets' ? 'text-amber-500 border-b-2 border-amber-500 bg-stone-800' : 'text-stone-500 hover:text-stone-300'}`}>Varlıklar</button>
        <button onClick={() => setActiveTab('finance')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'finance' ? 'text-amber-500 border-b-2 border-amber-500 bg-stone-800' : 'text-stone-500 hover:text-stone-300'}`}>Finans</button>
        <button onClick={() => setActiveTab('market')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'market' ? 'text-amber-500 border-b-2 border-amber-500 bg-stone-800' : 'text-stone-500 hover:text-stone-300'}`}>Pazar</button>
        <button onClick={() => setActiveTab('rivals')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'rivals' ? 'text-amber-500 border-b-2 border-amber-500 bg-stone-800' : 'text-stone-500 hover:text-stone-300'}`}>Rakipler</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        
        {activeTab === 'assets' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-stone-500 text-xs uppercase tracking-widest font-bold">Mülkler & Yatırımlar</h3>
                <button onClick={() => setShowBuildMenu(!showBuildMenu)} className="text-xs bg-stone-800 hover:bg-stone-700 text-amber-500 border border-stone-600 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                  <Plus size={12} /> Yeni Yatırım
                </button>
              </div>

              {showBuildMenu && (
                <div className="bg-stone-800 p-3 rounded border border-amber-900/50 mb-3 animate-in slide-in-from-top-2">
                    <h4 className="text-amber-200 font-bold text-sm mb-3 flex items-center gap-2">Yatırım Planla</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {(Object.values(AssetType) as AssetType[]).map((type) => (
                        <button key={type} onClick={() => setSelectedAssetType(type)} className={`text-[10px] p-2 border rounded flex flex-col items-center gap-1 transition-colors ${selectedAssetType === type ? 'bg-amber-900/40 border-amber-500 text-amber-100' : 'bg-stone-900 border-stone-700 text-stone-400 hover:bg-stone-700'}`}>
                          {getAssetIcon(type, 16)}
                          <span className="font-bold">{type}</span>
                          <span className="text-amber-500">{ASSET_COSTS[type]} F</span>
                        </button>
                      ))}
                    </div>
                    <h5 className="text-xs text-stone-500 font-bold uppercase mb-2">Konum Seç</h5>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {Object.values(KingdomType).map((kName) => {
                        const embargoed = isEmbargoed(kName);
                        return (
                          <button key={kName} disabled={gold < ASSET_COSTS[selectedAssetType] || embargoed} onClick={() => { onBuildAsset(kName, selectedAssetType); setShowBuildMenu(false); }} className="relative text-[10px] p-1.5 bg-stone-900 hover:bg-stone-700 border border-stone-600 rounded text-left text-stone-300 truncate disabled:opacity-40 flex items-center justify-between">
                            <span>{kName}</span>
                            {embargoed && <Ban size={10} className="text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                </div>
              )}

              {workshops.length === 0 ? (
                <div className="text-stone-600 text-center py-4 italic text-xs border border-dashed border-stone-700 rounded">Hiçbir krallıkta mülkünüz yok.</div>
              ) : (
                <div className="space-y-2">
                  {workshops.map((ws) => {
                    const underSiege = isKingdomUnderSiege(ws.kingdomName);
                    return (
                      <div key={ws.id} className={`p-2 rounded border relative overflow-hidden ${underSiege ? 'bg-red-950/20 border-red-900' : 'bg-stone-800 border-stone-700'}`}>
                        {underSiege && (<div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[1px]"><span className="text-red-500 font-bold text-xs uppercase border-2 border-red-600 px-2 py-1 rounded -rotate-12">İşgal Altında (Kapalı)</span></div>)}
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-full bg-stone-900 border border-stone-600 text-amber-500`}>{getAssetIcon(ws.type)}</div>
                              <div><div className="font-bold text-stone-300 text-xs">{ws.kingdomName}</div><div className="text-[10px] text-stone-500">{ws.type}</div></div>
                            </div>
                            <div className="text-right"><div className={`text-[10px] ${underSiege ? 'text-stone-600' : 'text-green-400'}`}>+{underSiege ? 0 : ws.goldIncome} F</div><div className="text-[10px] text-red-900/70">-{ws.maintenance} Gider</div></div>
                        </div>
                        {!underSiege && (<button onClick={() => onSellAsset(ws.id)} className="w-full mt-2 text-[9px] bg-stone-900 hover:bg-stone-700 text-stone-400 py-0.5 rounded border border-stone-700 flex items-center justify-center gap-1"><DollarSign size={9} /> Varlığı Sat (+{ASSET_COSTS[ws.type] * 0.6} F)</button>)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div>
               <h3 className="text-stone-500 text-xs uppercase tracking-widest mb-3 font-bold flex items-center gap-2"><Sword size={12} /> Tahsilat Ekibi</h3>
               <div className="space-y-2 mb-3">
                  {agents.map(agent => (
                     <div key={agent.id} className="bg-stone-800 p-2 rounded border border-stone-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${agent.isBusy ? 'bg-red-500' : 'bg-green-500'}`}></div>
                           <div><div className="text-xs font-bold text-stone-300">{agent.name}</div><div className="text-[9px] text-stone-500">{agent.type} | Güç: {agent.intimidation}</div></div>
                        </div>
                        <div className="flex items-center gap-2"><span className="text-[10px] text-red-900">-{agent.costPerTurn}F/tur</span><button onClick={() => onFireAgent(agent.id)} className="text-stone-500 hover:text-red-500"><XCircle size={14} /></button></div>
                     </div>
                  ))}
                  {agents.length === 0 && (<div className="text-center text-[10px] text-stone-600 py-2">Kimseniz yok.</div>)}
               </div>
               <button onClick={onHireAgent} disabled={gold < 500} className="w-full py-2 bg-stone-800 hover:bg-stone-700 border border-dashed border-stone-600 text-stone-400 text-xs rounded flex items-center justify-center gap-2"><UserPlus size={12} /> Ekibe Adam Al (-500F)</button>
            </div>
            <div>
               <h3 className="text-stone-500 text-xs uppercase tracking-widest mb-3 font-bold flex items-center gap-2"><Handshake size={12} /> Kredi Talepleri</h3>
               {loanRequests.length === 0 ? (<div className="text-stone-600 italic text-xs">Yeni talep yok.</div>) : (
                  <div className="space-y-2">
                     {loanRequests.map(req => {
                        const hasBankInKingdom = workshops.some(w => w.kingdomName === req.kingdom && w.type === AssetType.BANK);
                        return (
                        <div key={req.id} className="bg-amber-900/10 border border-amber-900/30 p-2 rounded">
                           <div className="flex justify-between items-start"><span className="text-xs font-bold text-amber-500">{req.borrowerName}</span><span className="text-[10px] text-stone-500">{req.kingdom}</span></div>
                           <div className="flex justify-between text-[10px] text-stone-300 my-1"><span>İstek: {req.amount} F</span><span>Faiz: %{(req.offeredInterest * 100).toFixed(0)}</span></div>
                           {!hasBankInKingdom && (<div className="text-[9px] text-red-400 italic mb-1 flex items-center gap-1 bg-red-950/30 p-1 rounded"><Ban size={10} /> Bu krallıkta Bankerlik Ofisi gerekli.</div>)}
                           <div className="flex gap-2 mt-2">
                              <button onClick={() => onAcceptLoan(req.id)} disabled={gold < req.amount || !hasBankInKingdom} className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 text-[10px] py-1 rounded border border-green-900/50 flex items-center justify-center gap-1 disabled:opacity-30 disabled:grayscale"><CheckCircle size={10} /> Ver</button>
                              <button onClick={() => onRejectLoan(req.id)} className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-[10px] py-1 rounded border border-red-900/50 flex items-center justify-center gap-1"><XCircle size={10} /> Reddet</button>
                           </div>
                        </div>
                     )})}
                  </div>
               )}
            </div>
            <div>
              <h3 className="text-stone-500 text-xs uppercase tracking-widest mb-3 font-bold flex items-center gap-2"><Coins size={12} /> Alacak Defteri</h3>
              {activeLoans.length === 0 ? (<div className="text-stone-600 text-center py-4 italic text-xs border border-dashed border-stone-700 rounded">Aktif alacağınız yok.</div>) : (
                <div className="space-y-2">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className={`p-2 rounded border text-xs ${loan.status === 'defaulted' ? 'bg-red-950/20 border-red-900' : 'bg-stone-800 border-stone-700'}`}>
                      <div className="flex justify-between items-start mb-1"><div className="font-bold text-stone-300">{loan.borrowerName}</div><div className="text-[10px] text-stone-500">{loan.kingdom}</div></div>
                      <div className="flex justify-between mb-2"><span>Ana Para: {loan.principal}</span><span className="text-amber-500 font-bold">Ödenecek: {loan.totalDue}</span></div>
                      <div className="flex items-center justify-between text-[10px]">{loan.status === 'defaulted' ? (<span className="text-red-500 flex items-center gap-1"><Skull size={10} /> ÖDEMEDİ!</span>) : (<span className="text-stone-400">Vade: {1200 + loan.dueTurn}</span>)}</div>
                      {loan.status === 'defaulted' && (
                         <div className="mt-2 pt-2 border-t border-red-900/30">
                            <div className="text-[9px] text-red-400 mb-2">Deneme: {(loan.failedCollectionAttempts || 0)}/2</div>
                            <div className="flex gap-1 overflow-x-auto">
                               {agents.filter(a => !a.isBusy).length === 0 ? (<span className="text-[9px] text-red-400 italic">Müsait adamınız yok.</span>) : (
                                  agents.filter(a => !a.isBusy).map(agent => (
                                     <button key={agent.id} onClick={() => onCollectDebt(loan.id, agent.id)} className="flex items-center gap-1 bg-red-900/40 hover:bg-red-800 text-stone-200 px-2 py-1 rounded border border-red-900/50 text-[9px] whitespace-nowrap"><ShieldCheck size={10} /> {agent.name} Gönder</button>
                                  ))
                               )}
                            </div>
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-4">
             <h3 className="text-sm font-bold uppercase text-stone-400 flex items-center gap-2"><Store size={16} /> Kara Borsa Emtiaları</h3>
             
             {/* Resource List */}
             {(['weapons', 'grain', 'medicine'] as ResourceType[]).map(res => {
                const item = market[res];
                const sellPrice = Math.floor(item.price * 0.8);
                let icon = <Hammer size={16} className="text-stone-400" />;
                let name = "Silah";
                let color = "text-stone-300";
                let playerStock = weapons;

                if (res === 'grain') { icon = <Wheat size={16} className="text-yellow-600" />; name = "Tahıl"; color = "text-yellow-200"; playerStock = grain; }
                if (res === 'medicine') { icon = <FlaskRound size={16} className="text-blue-500" />; name = "İlaç"; color = "text-blue-200"; playerStock = medicine; }

                return (
                   <div key={res} className="bg-stone-800 p-3 rounded border border-stone-600">
                      <div className="flex justify-between items-center mb-3 border-b border-stone-700 pb-2">
                         <div className="flex items-center gap-2 font-bold text-sm">
                            {icon} <span className="text-stone-300 uppercase">{name}</span>
                         </div>
                         <div className="flex items-center gap-1">
                            {item.trend === 'up' && <ArrowUpRight size={14} className="text-green-500" />}
                            {item.trend === 'down' && <ArrowDownRight size={14} className="text-red-500" />}
                            {item.trend === 'stable' && <Minus size={14} className="text-stone-500" />}
                            <span className="text-amber-400 font-mono">{item.price} F</span>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                         <div className="bg-stone-900 p-1.5 rounded text-center">
                            <div className="text-stone-500 uppercase">Pazar Stoğu</div>
                            <div className="font-bold text-stone-300">{item.stock}</div>
                         </div>
                         <div className="bg-stone-900 p-1.5 rounded text-center">
                            <div className="text-stone-500 uppercase">Senin Stoğun</div>
                            <div className={`font-bold ${color}`}>{playerStock}</div>
                         </div>
                      </div>

                      <div className="bg-stone-900/50 p-2 rounded border border-stone-700">
                        <div className="flex items-center justify-between mb-2">
                           <button onClick={() => setTradeAmount(Math.max(10, tradeAmount - 10))} className="p-1 bg-stone-800 hover:bg-stone-700 rounded text-stone-300 w-6">-</button>
                           <span className="text-xs font-bold text-stone-300">{tradeAmount} Adet</span>
                           <button onClick={() => setTradeAmount(tradeAmount + 10)} className="p-1 bg-stone-800 hover:bg-stone-700 rounded text-stone-300 w-6">+</button>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => onMarketTrade(res, 'buy', tradeAmount)} disabled={gold < (item.price * tradeAmount) || item.stock < tradeAmount} className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded disabled:opacity-30 flex items-center justify-center gap-1 text-[10px]">
                              <span className="text-stone-200">AL</span> <span className="text-red-400">-{item.price * tradeAmount}</span>
                           </button>
                           <button onClick={() => onMarketTrade(res, 'sell', tradeAmount)} disabled={playerStock < tradeAmount} className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded disabled:opacity-30 flex items-center justify-center gap-1 text-[10px]">
                              <span className="text-stone-200">SAT</span> <span className="text-green-400">+{sellPrice * tradeAmount}</span>
                           </button>
                        </div>
                      </div>
                   </div>
                );
             })}
          </div>
        )}

        {activeTab === 'rivals' && (
          <div className="space-y-4">
             <div className="bg-stone-800 p-3 rounded border border-stone-600">
                <h3 className="text-xs font-bold uppercase text-stone-400 mb-3 flex items-center gap-2"><Users size={14} /> Finansal Sıralama</h3>
                <div className="space-y-2">
                   {allBankers.map((banker, idx) => (
                      <div key={banker.id} className={`flex items-center justify-between p-2 rounded border ${banker.id === 'player' ? 'bg-amber-900/20 border-amber-700' : 'bg-stone-900 border-stone-800'}`}>
                         <div className="flex items-center gap-3">
                            <span className="text-stone-500 font-mono font-bold w-4">{idx + 1}</span>
                            <div><div className={`font-bold text-sm ${banker.color}`}>{banker.name}</div><div className="text-[10px] text-stone-500">{banker.workshops.length} Mülk</div></div>
                         </div>
                         <div className="text-right"><div className="font-bold text-stone-200 text-xs">{banker.netWorth.toLocaleString()} F</div><div className="text-[9px] text-stone-500 uppercase">Servet</div></div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Portfolio;
