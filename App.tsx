
import React, { useState, useEffect, useCallback } from 'react';
import Portfolio from './components/Portfolio';
import WarCard from './components/WarCard';
import RebellionCard from './components/RebellionCard';
import GameLog from './components/GameLog';
import GameMap from './components/GameMap';
import { GameState, Kingdom, KingdomType, War, LogEntry, Workshop, AssetType, Rebellion, Loan, Competitor, Agent, LoanRequest, ResourceType, MarketItem } from './types';
import { generateWarNarrative } from './services/geminiService';
import { Landmark, Map as MapIcon, Table2, RotateCcw, Skull, Menu, Globe } from 'lucide-react';

// --- 1. KINGDOMS CONFIGURATION (20 ITEMS) ---
const KINGDOMS: Kingdom[] = [
  { id: 'k1', name: KingdomType.NORTH, strength: 80, color: 'bg-slate-700', lastWarTurn: -10 },
  { id: 'k2', name: KingdomType.SOUTH, strength: 90, color: 'bg-red-800', lastWarTurn: -10 },
  { id: 'k3', name: KingdomType.EAST, strength: 75, color: 'bg-yellow-700', lastWarTurn: -10 },
  { id: 'k4', name: KingdomType.WEST, strength: 85, color: 'bg-blue-800', lastWarTurn: -10 },
  { id: 'k5', name: KingdomType.HIGHLAND, strength: 60, color: 'bg-stone-600', lastWarTurn: -10 },
  { id: 'k6', name: KingdomType.ISLAND, strength: 70, color: 'bg-teal-800', lastWarTurn: -10 },
  { id: 'k7', name: KingdomType.VALLEY, strength: 65, color: 'bg-emerald-700', lastWarTurn: -10 },
  { id: 'k8', name: KingdomType.RIVER, strength: 72, color: 'bg-cyan-700', lastWarTurn: -10 },
  { id: 'k9', name: KingdomType.DESERT, strength: 68, color: 'bg-orange-600', lastWarTurn: -10 },
  { id: 'k10', name: KingdomType.ICE, strength: 82, color: 'bg-indigo-300', lastWarTurn: -10 },
  { id: 'k11', name: KingdomType.FOREST, strength: 74, color: 'bg-green-800', lastWarTurn: -10 },
  { id: 'k12', name: KingdomType.SWAMP, strength: 55, color: 'bg-lime-900', lastWarTurn: -10 },
  { id: 'k13', name: KingdomType.IRON, strength: 88, color: 'bg-gray-600', lastWarTurn: -10 },
  { id: 'k14', name: KingdomType.GOLD, strength: 78, color: 'bg-yellow-500', lastWarTurn: -10 },
  { id: 'k15', name: KingdomType.STORM, strength: 85, color: 'bg-violet-800', lastWarTurn: -10 },
  { id: 'k16', name: KingdomType.CRYSTAL, strength: 60, color: 'bg-pink-200', lastWarTurn: -10 },
  { id: 'k17', name: KingdomType.VOLCANO, strength: 92, color: 'bg-red-950', lastWarTurn: -10 },
  { id: 'k18', name: KingdomType.STEPPE, strength: 76, color: 'bg-amber-700', lastWarTurn: -10 },
  { id: 'k19', name: KingdomType.SECRET, strength: 95, color: 'bg-purple-900', lastWarTurn: -10 },
  { id: 'k20', name: KingdomType.TRADE, strength: 50, color: 'bg-sky-600', lastWarTurn: -10 },
];

// --- 2. COMPETITOR GENERATOR (15 RIVALS) ---
const generateCompetitors = (count: number): Competitor[] => {
  const names = [
    "Medici Ailesi", "Demir Banka", "Venedik Tüccarları", "Ceneviz Bankası", "Tapınak Şövalyeleri",
    "Hanse Birliği", "Fugger Hanedanı", "Bardi Ailesi", "Peruzzi Şirketi", "Altın Post Loncası",
    "Kızıl Tüccarlar", "Gölge Bankası", "Kraliyet Hazinesi", "Doğu İpek Yolu", "Kuzey Balıkçıları"
  ];
  const colors = [
    "text-red-400", "text-blue-300", "text-green-400", "text-yellow-300", "text-purple-400",
    "text-pink-400", "text-indigo-400", "text-orange-400", "text-teal-400", "text-cyan-400",
    "text-lime-400", "text-emerald-400", "text-rose-400", "text-fuchsia-400", "text-sky-400"
  ];

  return Array.from({ length: count }).map((_, i) => {
    const personality = Math.random() > 0.6 ? 'aggressive' : (Math.random() > 0.3 ? 'conservative' : 'balanced');
    const startGold = 5000 + Math.floor(Math.random() * 30000);
    return {
      id: `comp-${i}`,
      name: names[i] || `Rakip ${i+1}`,
      color: colors[i % colors.length],
      gold: startGold,
      weapons: 50 + Math.floor(Math.random() * 200),
      grain: 200 + Math.floor(Math.random() * 1000),
      medicine: 10 + Math.floor(Math.random() * 50),
      workshops: [],
      personality
    };
  });
};

const INITIAL_COMPETITORS = generateCompetitors(15);

const INITIAL_STATE: GameState = {
  gold: 5000,
  weapons: 200,
  grain: 1000,
  medicine: 50,
  turn: 1,
  reputation: 50,
  workshops: [],
  wars: [],
  rebellions: [],
  embargoes: [],
  loans: [],
  loanRequests: [],
  agents: [],
  competitors: INITIAL_COMPETITORS,
  market: {
    weapons: { price: 35, stock: 500, trend: 'stable' },
    grain: { price: 5, stock: 2000, trend: 'stable' },
    medicine: { price: 80, stock: 100, trend: 'stable' }
  },
  logs: [
    { id: 'init', turn: 0, message: 'Bankerlik ofisinizi açtınız. Altın, Çelik, Tahıl ve İlaç...', type: 'info' }
  ],
  isThinking: false,
  gameOver: false,
};

const ASSET_COSTS: Record<AssetType, number> = {
  [AssetType.FARM]: 2000,
  [AssetType.WEAPONSMITH]: 4000,
  [AssetType.APOTHECARY]: 5500,
  [AssetType.MINE]: 7500,
  [AssetType.BANK]: 15000
};

const AGENT_NAMES = ["Kara Baron", "Sessiz Engerek", "Kasap Bill", "Zehirli Ok", "Demir Yumruk", "Gölge"];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Generate a random war with Cooldown logic
  const createWar = useCallback((turn: number, kingdoms: Kingdom[]): War | null => {
    const eligibleKingdoms = kingdoms.filter(k => {
      const turnsSinceWar = turn - k.lastWarTurn;
      if (turnsSinceWar <= 5) {
         return Math.random() > 0.9; 
      }
      return true;
    });

    if (eligibleKingdoms.length < 2) return null;

    const attackerIdx = Math.floor(Math.random() * eligibleKingdoms.length);
    let defenderIdx = Math.floor(Math.random() * eligibleKingdoms.length);
    while (defenderIdx === attackerIdx) {
      defenderIdx = Math.floor(Math.random() * eligibleKingdoms.length);
    }

    const attacker = eligibleKingdoms[attackerIdx];
    const defender = eligibleKingdoms[defenderIdx];

    attacker.lastWarTurn = turn;
    defender.lastWarTurn = turn;

    const startStrAttacker = 40 + Math.floor(Math.random() * 20);
    const startStrDefender = 40 + Math.floor(Math.random() * 20);

    return {
      id: `war-${turn}-${Date.now()}`,
      attacker,
      defender,
      description: `${attacker.name} vs ${defender.name}`,
      round: 1,
      attackerStrength: startStrAttacker,
      defenderStrength: startStrDefender,
      attackerWeapons: 500,
      defenderWeapons: 500,
      attackerGoldReserve: 1000,
      defenderGoldReserve: 1000,
      playerSupportSide: null,
      playerInvestmentTotal: 0,
      goldSaturation: 0,
      resolved: false,
      competitorLog: []
    };
  }, []);

  // Initial War Spawn
  useEffect(() => {
    const war = createWar(1, KINGDOMS);
    if (war) {
      const a = KINGDOMS.find(k => k.id === war.attacker.id);
      const d = KINGDOMS.find(k => k.id === war.defender.id);
      if (a) a.lastWarTurn = 1;
      if (d) d.lastWarTurn = 1;

      setGameState(prev => ({
        ...prev,
        wars: [war]
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    KINGDOMS.forEach(k => k.lastWarTurn = -10);
    const newCompetitors = generateCompetitors(15);
    const newState: GameState = {
      ...INITIAL_STATE,
      competitors: newCompetitors, 
      logs: [{ id: `init-${Date.now()}`, turn: 0, message: 'Oyun sıfırlandı. Yeni bir çağ başlıyor.', type: 'info' }],
      wars: []
    };

    const war = createWar(1, KINGDOMS);
    if (war) {
      const a = KINGDOMS.find(k => k.id === war.attacker.id);
      const d = KINGDOMS.find(k => k.id === war.defender.id);
      if (a) a.lastWarTurn = 1;
      if (d) d.lastWarTurn = 1;
      newState.wars = [war];
    }

    setGameState(newState);
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info', isGemini: boolean = false) => {
    setGameState(prev => ({
      ...prev,
      logs: [...prev.logs, { id: Date.now().toString() + Math.random(), turn: prev.turn, message, type, isGemini }]
    }));
  };

  const buildAsset = (kingdomName: KingdomType, type: AssetType) => {
    const COST = ASSET_COSTS[type];
    if (gameState.gold < COST) return;

    let productionRate = 0;
    let goldIncome = 0;
    let maintenance = 0;

    // Production Rates
    switch (type) {
      case AssetType.FARM: productionRate = 100; goldIncome = 50; maintenance = 50; break; // Produces Grain
      case AssetType.WEAPONSMITH: productionRate = 50; maintenance = 150; break; // Produces Weapons
      case AssetType.APOTHECARY: productionRate = 20; maintenance = 100; break; // Produces Medicine
      case AssetType.MINE: goldIncome = 900; maintenance = 200; break;
      case AssetType.BANK: goldIncome = 0; maintenance = 500; break;
    }

    const newWorkshop: Workshop = {
      id: `ws-${Date.now()}`,
      kingdomName,
      type,
      productionRate,
      goldIncome,
      maintenance
    };

    setGameState(prev => ({
      ...prev,
      gold: prev.gold - COST,
      workshops: [...prev.workshops, newWorkshop]
    }));

    addLog(`${kingdomName} topraklarında yeni bir ${type} kuruldu (-${COST} Florin).`, 'success');
  };

  const sellAsset = (assetId: string) => {
    setGameState(prev => {
      const asset = prev.workshops.find(w => w.id === assetId);
      if (!asset) return prev;
      const salePrice = Math.floor(ASSET_COSTS[asset.type] * 0.6);
      addLog(`${asset.kingdomName} bölgesindeki ${asset.type} satıldı (+${salePrice} F).`, 'warning');
      return {
        ...prev,
        gold: prev.gold + salePrice,
        workshops: prev.workshops.filter(w => w.id !== assetId)
      };
    });
  };

  const hireAgent = () => {
    setGameState(prev => {
      if (prev.gold < 500) return prev;
      const types = ['Thug', 'Mercenary', 'Assassin'] as const;
      const selectedType = types[Math.floor(Math.random() * types.length)];
      let intimidation = 0;
      let cost = 0;

      if (selectedType === 'Thug') { intimidation = 40 + Math.floor(Math.random() * 20); cost = 50; }
      if (selectedType === 'Mercenary') { intimidation = 60 + Math.floor(Math.random() * 20); cost = 150; }
      if (selectedType === 'Assassin') { intimidation = 85 + Math.floor(Math.random() * 15); cost = 300; }

      const newAgent: Agent = {
        id: `ag-${Date.now()}`,
        name: AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)],
        type: selectedType,
        intimidation,
        costPerTurn: cost,
        isBusy: false
      };

      addLog(`${newAgent.name} (${selectedType}) ekibe katıldı.`, 'success');
      return { ...prev, gold: prev.gold - 500, agents: [...prev.agents, newAgent] };
    });
  };

  const fireAgent = (agentId: string) => {
    setGameState(prev => ({ ...prev, agents: prev.agents.filter(a => a.id !== agentId) }));
  };

  const acceptLoan = (requestId: string) => {
    setGameState(prev => {
      const req = prev.loanRequests.find(r => r.id === requestId);
      if (!req || prev.gold < req.amount) return prev;

      const newLoan: Loan = {
        id: `loan-${Date.now()}`,
        kingdom: req.kingdom,
        borrowerName: req.borrowerName,
        principal: req.amount,
        interestRate: req.offeredInterest,
        totalDue: Math.floor(req.amount * (1 + req.offeredInterest)),
        dueTurn: prev.turn + req.duration,
        status: 'active',
        failedCollectionAttempts: 0
      };

      addLog(`${req.borrowerName} kişisine ${req.amount}F borç verildi.`, 'warning');
      return {
        ...prev,
        gold: prev.gold - req.amount,
        loanRequests: prev.loanRequests.filter(r => r.id !== requestId),
        loans: [...prev.loans, newLoan]
      };
    });
  };

  const rejectLoan = (requestId: string) => {
    setGameState(prev => ({ ...prev, loanRequests: prev.loanRequests.filter(r => r.id !== requestId) }));
  };

  const collectDebt = (loanId: string, agentId: string) => {
    setGameState(prev => {
       const loanIdx = prev.loans.findIndex(l => l.id === loanId);
       const agentIdx = prev.agents.findIndex(a => a.id === agentId);
       if (loanIdx === -1 || agentIdx === -1) return prev;
       
       const loan = prev.loans[loanIdx];
       const agent = prev.agents[agentIdx];
       if (agent.isBusy) return prev;

       const roll = Math.random() * 100;
       const success = roll < agent.intimidation;
       
       const updatedLoans = [...prev.loans];
       const updatedAgents = [...prev.agents];
       updatedAgents[agentIdx] = { ...agent, isBusy: true };

       if (success) {
          updatedLoans[loanIdx] = { ...loan, status: 'collected' };
          addLog(`${agent.name}, ${loan.borrowerName}'in kapısına dayandı ve parayı aldı (+${loan.totalDue} F).`, 'success');
          return { ...prev, gold: prev.gold + loan.totalDue, loans: updatedLoans, agents: updatedAgents };
       } else {
          const newAttempts = (loan.failedCollectionAttempts || 0) + 1;
          if (newAttempts >= 2) {
             updatedLoans[loanIdx] = { ...loan, status: 'lost', failedCollectionAttempts: newAttempts };
             addLog(`${agent.name}, ${loan.borrowerName} tarafından atlatıldı. Borçlu şehirden kaçtı! Borç silindi.`, 'danger');
          } else {
             updatedLoans[loanIdx] = { ...loan, failedCollectionAttempts: newAttempts };
             addLog(`${agent.name}, ${loan.borrowerName} tarafından atlatıldı. Tahsilat başarısız (${newAttempts}/2).`, 'danger');
          }
          return { ...prev, loans: updatedLoans, agents: updatedAgents };
       }
    });
  };

  const handleWarSupport = (warId: string, side: 'attacker' | 'defender', amount: number, type: 'gold' | 'weapons') => {
    setGameState(prev => {
      const war = prev.wars.find(w => w.id === warId);
      if (!war) return prev;

      let newGold = prev.gold;
      let newWeapons = prev.weapons;
      let logMessage = "";
      let strengthImpact = 0;

      if (type === 'gold') {
        newGold -= amount;
        logMessage = `Savaş kasasına ${amount} Florin hibe edildi.`;
        // Gold doesn't directly increase strength anymore in this model, handled in resolveTurn
        strengthImpact = 0; 
      } else {
        const qty = amount; 
        const strength = side === 'attacker' ? war.attackerStrength : war.defenderStrength;
        const unitPrice = Math.floor(prev.market.weapons.price * 1.2); // Selling directly to war is usually premium
        const revenue = qty * unitPrice;
        
        newWeapons -= qty;
        newGold += revenue;
        logMessage = `${qty} adet silah ${unitPrice} Florinden satıldı (+${revenue} F).`;
        strengthImpact = (qty / 50); 
      }
      
      const updatedWars = prev.wars.map(w => {
        if (w.id === warId) {
          const investmentValue = type === 'gold' ? amount : (amount * 10); 
          const newSaturation = type === 'gold' ? w.goldSaturation + amount : w.goldSaturation;
          
          let newAttStr = w.attackerStrength;
          let newDefStr = w.defenderStrength;
          let newAttGold = w.attackerGoldReserve;
          let newDefGold = w.defenderGoldReserve;
          let newAttWeapons = w.attackerWeapons;
          let newDefWeapons = w.defenderWeapons;

          if (side === 'attacker') {
             if (type === 'gold') newAttGold += amount;
             else { newAttWeapons += amount; newAttStr = Math.min(100, w.attackerStrength + strengthImpact); }
          } else {
             if (type === 'gold') newDefGold += amount;
             else { newDefWeapons += amount; newDefStr = Math.min(100, w.defenderStrength + strengthImpact); }
          }

          return { 
            ...w, 
            playerSupportSide: side, 
            playerInvestmentTotal: w.playerInvestmentTotal + investmentValue,
            goldSaturation: newSaturation,
            attackerStrength: newAttStr,
            defenderStrength: newDefStr,
            attackerGoldReserve: newAttGold,
            defenderGoldReserve: newDefGold,
            attackerWeapons: newAttWeapons,
            defenderWeapons: newDefWeapons
          };
        }
        return w;
      });
      addLog(logMessage, type === 'gold' ? 'warning' : 'success');
      return { ...prev, gold: newGold, weapons: newWeapons, wars: updatedWars };
    });
  };

  const handleMarketTrade = (resource: ResourceType, action: 'buy' | 'sell', amount: number) => {
     setGameState(prev => {
        const marketItem = prev.market[resource];
        const currentPrice = marketItem.price;
        const sellPrice = Math.floor(currentPrice * 0.8);
        
        let newGold = prev.gold;
        let newResourceAmount = prev[resource];
        let newMarketStock = marketItem.stock;
        let newMarketPrice = currentPrice;

        if (action === 'buy') {
           if (prev.gold < currentPrice * amount || marketItem.stock < amount) return prev;
           newGold -= currentPrice * amount;
           newResourceAmount += amount;
           newMarketStock -= amount;
           
           const priceImpact = Math.ceil(amount / (resource === 'medicine' ? 5 : 25)); // Medicine is more sensitive
           newMarketPrice += priceImpact;

           addLog(`Kara Borsadan ${amount} ${resource} alındı (-${currentPrice * amount} F).`, 'warning');
        } else {
           if (newResourceAmount < amount) return prev;
           newGold += sellPrice * amount;
           newResourceAmount -= amount;
           newMarketStock += amount;

           const priceImpact = Math.ceil(amount / (resource === 'medicine' ? 5 : 25));
           newMarketPrice -= priceImpact;

           addLog(`Kara Borsaya ${amount} ${resource} satıldı (+${sellPrice * amount} F).`, 'success');
        }

        // Clamp Price
        newMarketPrice = Math.max(2, Math.min(500, newMarketPrice));
        const trend = newMarketPrice > currentPrice ? 'up' : (newMarketPrice < currentPrice ? 'down' : 'stable');

        return { 
           ...prev, 
           gold: newGold, 
           [resource]: newResourceAmount, 
           market: { 
              ...prev.market, 
              [resource]: {
                 ...prev.market[resource],
                 stock: newMarketStock,
                 price: newMarketPrice,
                 trend: trend
              }
           } 
        };
     });
  };

  const handleRebellionSupport = (rebellionId: string, amount: number, side: 'rebels' | 'crown') => {
     setGameState(prev => {
        const rebIndex = prev.rebellions.findIndex(r => r.id === rebellionId);
        if (rebIndex === -1) return prev;
        
        const reb = prev.rebellions[rebIndex];
        if (prev.gold < amount) return prev;

        const updatedRebs = [...prev.rebellions];
        updatedRebs[rebIndex] = { ...reb, supportSide: side, playerInvestment: reb.playerInvestment + amount };
        
        // Investment instantly affects strength slightly
        const impact = side === 'rebels' ? 5 : -5;
        updatedRebs[rebIndex].strength = Math.max(0, Math.min(100, updatedRebs[rebIndex].strength + impact));

        return { ...prev, gold: prev.gold - amount, rebellions: updatedRebs };
     });
     const target = side === 'rebels' ? 'İsyancılara' : 'Kraliyet Muhafızlarına';
     addLog(`${target} ${amount} Florin destek gönderildi.`, 'warning');
  };

  const simulateCompetitors = (currentCompetitors: Competitor[], activeWars: War[], market: Record<ResourceType, MarketItem>, turn: number) => {
    const logs: LogEntry[] = [];
    const newCompetitors = [...currentCompetitors];
    const modifiedWars = [...activeWars];
    const updatedMarket = { ...market };

    newCompetitors.forEach((comp, idx) => {
      const assetIncome = comp.workshops.reduce((sum, w) => sum + w.goldIncome - w.maintenance, 0);
      const baseIncome = 500; 
      comp.gold += Math.max(0, assetIncome + baseIncome);

      // AI Trading Logic (Simplistic)
      // They buy low, sell high for all resources
      (['weapons', 'grain', 'medicine'] as ResourceType[]).forEach(res => {
         const item = updatedMarket[res];
         const idealPrice = res === 'weapons' ? 35 : (res === 'grain' ? 5 : 80);
         
         // Buy if cheap and has gold
         if (item.price < idealPrice && comp.gold > 2000 && item.stock > 10) {
             const amount = res === 'grain' ? 200 : 20;
             if (comp.gold >= item.price * amount) {
                comp.gold -= item.price * amount;
                comp[res] += amount;
                item.stock -= amount;
                item.price += 1;
             }
         }
         // Sell if expensive and has stock
         if (item.price > idealPrice * 1.5 && comp[res] > 0) {
             const amount = Math.min(comp[res], res === 'grain' ? 200 : 20);
             comp[res] -= amount;
             comp.gold += (item.price * 0.8) * amount;
             item.stock += amount;
             item.price = Math.max(1, item.price - 1);
         }
      });


      if (comp.gold > 6000 && Math.random() > 0.6) {
        const targetKingdom = KINGDOMS[Math.floor(Math.random() * KINGDOMS.length)].name;
        const affordableTypes = (Object.keys(ASSET_COSTS) as AssetType[]).filter(t => ASSET_COSTS[t] <= comp.gold);
        
        if (affordableTypes.length > 0) {
           const chosenType = affordableTypes[Math.floor(Math.random() * affordableTypes.length)];
           const cost = ASSET_COSTS[chosenType];
           
           comp.gold -= cost;
           let prodRate = 0;
           let goldInc = 0;
           let maint = 0;
           
           if (chosenType === AssetType.FARM) { prodRate = 100; goldInc = 50; maint = 50; }
           if (chosenType === AssetType.APOTHECARY) { prodRate = 20; maint = 100; }
           if (chosenType === AssetType.WEAPONSMITH) { prodRate = 50; maint = 150; }
           if (chosenType === AssetType.MINE) { goldInc = 900; maint = 200; }
           if (chosenType === AssetType.BANK) { maint = 500; }

           comp.workshops.push({
             id: `comp-ws-${Date.now()}-${idx}`,
             kingdomName: targetKingdom,
             type: chosenType,
             productionRate: prodRate,
             goldIncome: goldInc,
             maintenance: maint
           });
           logs.push({ id: `log-ai-${Date.now()}-${idx}`, turn: turn, message: `${comp.name}, ${targetKingdom}'de yeni bir ${chosenType} satın aldı.`, type: 'rival' });
        }
      }

      modifiedWars.forEach(war => {
         if (war.resolved) return;
         let chance = 0.3;
         if (comp.personality === 'aggressive') chance = 0.6;
         if (comp.personality === 'conservative') chance = 0.2;

         if (Math.random() < chance && comp.gold > 3000) {
            let side: 'attacker' | 'defender' = Math.random() > 0.5 ? 'attacker' : 'defender';
            if (comp.personality === 'aggressive') side = war.attackerStrength < war.defenderStrength ? 'attacker' : 'defender';
            else if (comp.personality === 'conservative') side = war.attackerStrength > war.defenderStrength ? 'attacker' : 'defender';

            // AI Sells weapons to war from their stock if they have it
            if (comp.weapons > 50) {
               const qty = 50;
               const strength = side === 'attacker' ? war.attackerStrength : war.defenderStrength;
               const unitPrice = Math.floor(updatedMarket.weapons.price * 1.2);
               const revenue = qty * unitPrice;
               
               comp.weapons -= qty;
               comp.gold += revenue;
               
               const impact = 1;
               if (side === 'attacker') { war.attackerStrength = Math.min(100, war.attackerStrength + impact); war.attackerWeapons += qty; }
               else { war.defenderStrength = Math.min(100, war.defenderStrength + impact); war.defenderWeapons += qty; }

               if (!war.competitorLog) war.competitorLog = [];
               war.competitorLog.push({ competitorName: comp.name, side, amount: revenue });
               logs.push({ id: `log-war-ai-${Date.now()}-${idx}`, turn: turn, message: `${comp.name}, ${side === 'attacker' ? war.attacker.name : war.defender.name} ordusuna silah sattı.`, type: 'rival' });
            }
         }
      });
    });
    return { updatedCompetitors: newCompetitors, updatedWars: modifiedWars, newLogs: logs, updatedMarket };
  };

  const resolveTurn = async () => {
    setGameState(prev => ({ ...prev, isThinking: true }));
    const nextTurn = gameState.turn + 1;
    
    const siegedZones = new Set<string>();
    gameState.wars.filter(w => !w.resolved).forEach(w => {
       siegedZones.add(w.defender.name);
    });

    let incomeLog = "";
    // Calculate Gold Income
    const assetIncome = gameState.workshops.reduce((sum, w) => {
       if (siegedZones.has(w.kingdomName)) return sum; 
       return sum + w.goldIncome;
    }, 0);
    
    const blockedCount = gameState.workshops.filter(w => siegedZones.has(w.kingdomName)).length;
    if (blockedCount > 0) incomeLog = `${blockedCount} işletmeniz işgal/savunma savaşı nedeniyle kapalı.`;

    const agentCosts = gameState.agents.reduce((sum, a) => sum + a.costPerTurn, 0);
    const maintenance = gameState.workshops.reduce((sum, w) => sum + w.maintenance, 0) + agentCosts;
    
    // PRODUCTION
    let producedWeapons = 0;
    let producedGrain = 0;
    let producedMedicine = 0;

    gameState.workshops.forEach(w => {
        if (siegedZones.has(w.kingdomName)) return;
        if (w.type === AssetType.WEAPONSMITH) producedWeapons += w.productionRate;
        if (w.type === AssetType.FARM) producedGrain += w.productionRate;
        if (w.type === AssetType.APOTHECARY) producedMedicine += w.productionRate;
    });

    let currentGold = gameState.gold + assetIncome - maintenance;
    let currentWeapons = gameState.weapons + producedWeapons;
    let currentGrain = gameState.grain + producedGrain;
    let currentMedicine = gameState.medicine + producedMedicine;

    let currentWorkshops = [...gameState.workshops];
    let currentEmbargoes = gameState.embargoes.filter(e => e.untilTurn > gameState.turn);
    let currentLoans = [...gameState.loans];
    let currentAgents = gameState.agents.map(a => ({...a, isBusy: false}));
    let currentLoanRequests = [...gameState.loanRequests];
    let currentLogs = [...gameState.logs];
    let currentRebellions = [...gameState.rebellions];

    if (currentGold < 0) {
       setGameState(prev => ({ ...prev, gold: currentGold, isThinking: false, gameOver: true, logs: [...prev.logs, { id: `gameover-${Date.now()}`, turn: prev.turn, message: "İFLAS ETTİNİZ! Kasa eksiye düştü.", type: 'danger' }] }));
       return;
    }
    if (incomeLog) currentLogs.push({ id: `inc-${Date.now()}`, turn: nextTurn, message: incomeLog, type: 'warning' });

    // AI & Market Simulation
    const simulationResult = simulateCompetitors(gameState.competitors, gameState.wars, gameState.market, nextTurn);
    currentLogs = [...currentLogs, ...simulationResult.newLogs];
    let currentWars = simulationResult.updatedWars;
    let currentCompetitors = simulationResult.updatedCompetitors;
    let currentMarket = simulationResult.updatedMarket;

    // --- SUPPLY & DEMAND & WAR CONSUMPTION ---
    // 1. Global Production Flowing to Market (20% of all production goes to black market)
    const playerWs = currentWorkshops;
    const rivalWs = currentCompetitors.flatMap(c => c.workshops);
    const allWorkshops = [...playerWs, ...rivalWs].filter(w => !siegedZones.has(w.kingdomName));
    
    const totalWeaponProd = allWorkshops.filter(w => w.type === AssetType.WEAPONSMITH).length * 50;
    const totalGrainProd = allWorkshops.filter(w => w.type === AssetType.FARM).length * 100;
    const totalMedProd = allWorkshops.filter(w => w.type === AssetType.APOTHECARY).length * 20;

    currentMarket.weapons.stock += Math.floor(totalWeaponProd * 0.2);
    currentMarket.grain.stock += Math.floor(totalGrainProd * 0.3);
    currentMarket.medicine.stock += Math.floor(totalMedProd * 0.2);

    // 2. War Consumption (Kingdoms buy from market with their reserve gold)
    const activeWarCount = currentWars.filter(w => !w.resolved).length;
    
    if (activeWarCount > 0) {
        // Each active war consumes resources from market
        const weaponDemand = activeWarCount * 150;
        const grainDemand = activeWarCount * 800; // High grain demand
        const medDemand = activeWarCount * 40;

        currentMarket.weapons.stock = Math.max(0, currentMarket.weapons.stock - weaponDemand);
        currentMarket.grain.stock = Math.max(0, currentMarket.grain.stock - grainDemand);
        currentMarket.medicine.stock = Math.max(0, currentMarket.medicine.stock - medDemand);
        
        if (currentMarket.weapons.stock < 50) currentLogs.push({ id: `dearth-w-${Date.now()}`, turn: nextTurn, message: "Silah kıtlığı! Fiyatlar artıyor.", type: 'warning' });
        if (currentMarket.grain.stock < 200) currentLogs.push({ id: `dearth-g-${Date.now()}`, turn: nextTurn, message: "Tahıl kıtlığı! Ordular aç.", type: 'warning' });
        if (currentMarket.medicine.stock < 20) currentLogs.push({ id: `dearth-m-${Date.now()}`, turn: nextTurn, message: "İlaç yok! Salgın riski.", type: 'danger' });
    }

    // 3. Price Adjustment
    (['weapons', 'grain', 'medicine'] as ResourceType[]).forEach(res => {
        const item = currentMarket[res];
        let priceChange = 0;
        
        // Scarcity impact
        if (res === 'weapons') {
           if (item.stock < 200) priceChange += 15;
           if (item.stock > 2000) priceChange -= 5;
           if (activeWarCount > 0) priceChange += (activeWarCount * 5);
        } else if (res === 'grain') {
           if (item.stock < 1000) priceChange += 3;
           if (item.stock > 5000) priceChange -= 1;
           if (activeWarCount > 0) priceChange += (activeWarCount * 1);
        } else if (res === 'medicine') {
           if (item.stock < 50) priceChange += 25;
           if (item.stock > 300) priceChange -= 5;
           if (activeWarCount > 0) priceChange += (activeWarCount * 8);
        }

        // Random fluctuation
        priceChange += (Math.random() * 4 - 2);
        
        const oldPrice = item.price;
        item.price = Math.max(1, Math.floor(item.price + priceChange));
        item.trend = item.price > oldPrice ? 'up' : (item.price < oldPrice ? 'down' : 'stable');
    });


    // REBELLION LOGIC
    const peacefulKingdoms = KINGDOMS.filter(k => 
       !siegedZones.has(k.name) && !currentRebellions.some(r => r.kingdom === k.name)
    );
    if (Math.random() < 0.15 && peacefulKingdoms.length > 0) {
       const target = peacefulKingdoms[Math.floor(Math.random() * peacefulKingdoms.length)];
       const newReb: Rebellion = {
          id: `reb-${Date.now()}`,
          kingdom: target.name,
          strength: 30 + Math.floor(Math.random() * 30),
          duration: 1,
          supportSide: null,
          playerInvestment: 0,
          resolved: false
       };
       currentRebellions.push(newReb);
       currentLogs.push({ id: `new-reb-${newReb.id}`, turn: nextTurn, message: `İSYAN! ${target.name} halkı yönetime karşı ayaklandı.`, type: 'danger' });
    }

    // Helper to get a random asset reward with correct stats
    const getRandomRewardAsset = (kingdom: KingdomType, idPrefix: string): Workshop => {
        const types = [AssetType.FARM, AssetType.MINE, AssetType.WEAPONSMITH, AssetType.BANK, AssetType.APOTHECARY];
        const type = types[Math.floor(Math.random() * types.length)];
        let goldIncome = 0;
        let productionRate = 0;
        let maint = 0;

        switch(type) {
            case AssetType.FARM: productionRate = 100; goldIncome = 50; maint = 50; break;
            case AssetType.MINE: goldIncome = 900; maint = 200; break;
            case AssetType.WEAPONSMITH: productionRate = 50; maint = 150; break;
            case AssetType.APOTHECARY: productionRate = 20; maint = 100; break;
            case AssetType.BANK: maint = 500; break;
        }

        return {
            id: `${idPrefix}-${Date.now()}-${Math.random()}`,
            kingdomName: kingdom,
            type: type,
            productionRate,
            goldIncome,
            maintenance: maint
        };
    };

    // REBELLION RESOLUTION
    currentRebellions = currentRebellions.map(reb => {
       if (reb.resolved) return reb;
       
       const MAX_REBELLION_DURATION = 5;
       let newDuration = reb.duration + 1;
       const strengthChange = (Math.random() * 20) - 10; 
       let newStrength = Math.max(0, Math.min(100, reb.strength + strengthChange));
       
       if (newDuration > MAX_REBELLION_DURATION) {
          if (reb.supportSide === 'crown') {
             const reward = getRandomRewardAsset(reb.kingdom, 'crown-rew-time');
             currentWorkshops.push(reward);
             currentLogs.push({ id: `reb-time-${reb.id}`, turn: nextTurn, message: `${reb.kingdom} isyanı zamanla etkisini yitirdi. Kraliyet yardımınız için bir ${reward.type} bahşetti.`, type: 'success' });
          } else if (reb.supportSide === 'rebels') {
             currentEmbargoes.push({ kingdom: reb.kingdom, untilTurn: nextTurn + 3 });
             currentLogs.push({ id: `reb-time-fail-${reb.id}`, turn: nextTurn, message: `${reb.kingdom} isyanı başarısız oldu. Desteğiniz boşa gitti.`, type: 'danger' });
          } else {
             currentLogs.push({ id: `reb-time-neu-${reb.id}`, turn: nextTurn, message: `${reb.kingdom} isyanı zamanla dağıldı.`, type: 'info' });
          }
          return { ...reb, resolved: true, success: false, strength: 0, duration: newDuration };
       }

       if (newStrength > 85) {
          const playerHadAssets = currentWorkshops.some(w => w.kingdomName === reb.kingdom);
          if (playerHadAssets) {
             currentWorkshops = currentWorkshops.filter(w => w.kingdomName !== reb.kingdom);
             currentLogs.push({ id: `reb-succ-${reb.id}`, turn: nextTurn, message: `${reb.kingdom} isyanı başarılı oldu! Hükümet düştü ve mülkleriniz yağmalandı.`, type: 'danger' });
          } else if (reb.supportSide === 'rebels') {
             const rewardCount = Math.floor(Math.random() * 3) + 3; 
             for(let i=0; i<rewardCount; i++) {
                 const reward = getRandomRewardAsset(reb.kingdom, `reb-rew-${i}`);
                 currentWorkshops.push(reward);
             }
             currentLogs.push({ id: `reb-rew-msg-${reb.id}`, turn: nextTurn, message: `Desteğiniz sayesinde ${reb.kingdom} asileri kazandı. Size ganimet olarak ${rewardCount} yeni mülk verdiler.`, type: 'success' });
          } else {
             currentLogs.push({ id: `reb-succ-neu-${reb.id}`, turn: nextTurn, message: `${reb.kingdom} isyanı başarılı oldu. Yönetim değişti.`, type: 'info' });
          }
          return { ...reb, resolved: true, success: true, strength: 100, duration: newDuration };
       } else if (newStrength < 15) {
          if (reb.supportSide === 'crown') {
             const reward = getRandomRewardAsset(reb.kingdom, 'crown-rew');
             currentWorkshops.push(reward);
             currentLogs.push({ id: `crown-rew-msg-${reb.id}`, turn: nextTurn, message: `Kraliyet ${reb.kingdom} isyanını bastırdı ve ödül verdi.`, type: 'success' });
          } else if (reb.supportSide === 'rebels') {
             currentEmbargoes.push({ kingdom: reb.kingdom, untilTurn: nextTurn + 3 });
             currentLogs.push({ id: `embargo-${reb.id}`, turn: nextTurn, message: `${reb.kingdom} Kralı isyanı bastırdı. Ambargo yediniz!`, type: 'danger' });
          } else {
             currentLogs.push({ id: `reb-fail-${reb.id}`, turn: nextTurn, message: `${reb.kingdom} isyanı bastırıldı.`, type: 'info' });
          }
          return { ...reb, resolved: true, success: false, strength: 0, duration: newDuration };
       }
       return { ...reb, strength: newStrength, duration: newDuration };
    });

    const bankLocations = currentWorkshops.filter(w => w.type === AssetType.BANK).map(w => w.kingdomName);
    const uniqueBankLocations = [...new Set(bankLocations)];

    if (uniqueBankLocations.length > 0) {
       const numRequests = Math.floor(Math.random() * 3) + 1;
       for (let i = 0; i < numRequests; i++) {
          const kingdom = uniqueBankLocations[Math.floor(Math.random() * uniqueBankLocations.length)];
          const tierRoll = Math.random();
          let amount = 0;
          let borrowerTitle = "";
          if (tierRoll < 0.5) { amount = 500 + Math.floor(Math.random() * 1500); borrowerTitle = `Esnaf ${Math.floor(Math.random() * 100)}`; } 
          else if (tierRoll < 0.8) { amount = 2000 + Math.floor(Math.random() * 5500); borrowerTitle = `Lonca Başı ${Math.floor(Math.random() * 100)}`; } 
          else { amount = 7500 + Math.floor(Math.random() * 12500); borrowerTitle = `Kont ${Math.floor(Math.random() * 100)}`; }

          currentLoanRequests.push({
             id: `req-${Date.now()}-${i}`,
             kingdom,
             borrowerName: borrowerTitle,
             amount: amount,
             offeredInterest: 0.2 + (Math.random() * 0.1),
             duration: 3,
             expiresIn: 2
          });
       }
    }

    currentLoanRequests = currentLoanRequests.map(r => ({...r, expiresIn: r.expiresIn - 1})).filter(r => r.expiresIn > 0);

    for (let i = 0; i < currentLoans.length; i++) {
       const loan = currentLoans[i];
       if (loan.status === 'active' && loan.dueTurn <= nextTurn) {
          const defaultChance = 0.3; 
          if (Math.random() > defaultChance) {
             currentLoans[i] = { ...loan, status: 'paid' };
             currentGold += loan.totalDue;
             currentLogs.push({ id: `pay-${loan.id}`, turn: nextTurn, message: `${loan.borrowerName} borcunu ödedi (+${loan.totalDue} F).`, type: 'success' });
          } else {
             currentLoans[i] = { ...loan, status: 'defaulted' };
             currentLogs.push({ id: `def-${loan.id}`, turn: nextTurn, message: `${loan.borrowerName} borcunu ödemedi!`, type: 'danger' });
          }
       }
    }

    const updatedWars: War[] = [];

    for (const war of currentWars) {
      if (war.resolved) { updatedWars.push(war); continue; }
      
      // War Progression based on Weapon Stockpiles
      // If attacker has more weapons, they gain advantage
      let attAdvantage = 0;
      let defAdvantage = 0;
      
      // Kingdoms attempt to buy weapons from market using reserves
      if (war.attackerGoldReserve >= currentMarket.weapons.price) {
          const canBuy = Math.floor(war.attackerGoldReserve / currentMarket.weapons.price);
          const actualBuy = Math.min(canBuy, currentMarket.weapons.stock, 200); // Cap per turn
          if (actualBuy > 0) {
              war.attackerGoldReserve -= actualBuy * currentMarket.weapons.price;
              war.attackerWeapons += actualBuy;
              currentMarket.weapons.stock -= actualBuy;
          }
      }
      if (war.defenderGoldReserve >= currentMarket.weapons.price) {
          const canBuy = Math.floor(war.defenderGoldReserve / currentMarket.weapons.price);
          const actualBuy = Math.min(canBuy, currentMarket.weapons.stock, 200);
          if (actualBuy > 0) {
              war.defenderGoldReserve -= actualBuy * currentMarket.weapons.price;
              war.defenderWeapons += actualBuy;
              currentMarket.weapons.stock -= actualBuy;
          }
      }

      // Simple battle logic
      if (war.attackerWeapons > war.defenderWeapons) attAdvantage = 5 + Math.random() * 5;
      else if (war.defenderWeapons > war.attackerWeapons) defAdvantage = 5 + Math.random() * 5;

      let newAttStr = Math.min(100, Math.max(0, war.attackerStrength + attAdvantage - (Math.random() * 3)));
      let newDefStr = Math.min(100, Math.max(0, war.defenderStrength + defAdvantage - (Math.random() * 3)));
      
      // Weapons are consumed in battle
      war.attackerWeapons = Math.max(0, Math.floor(war.attackerWeapons * 0.9));
      war.defenderWeapons = Math.max(0, Math.floor(war.defenderWeapons * 0.9));

      let newRound = war.round + 1;
      let isResolved = false;
      let winner: Kingdom | null = null;

      if (newAttStr >= 90 || newDefStr >= 90 || newRound > 4) {
        isResolved = true;
        if (newAttStr > newDefStr) winner = war.attacker;
        else winner = war.defender;
      }

      if (isResolved && winner) {
         const isAttackerWinner = winner.id === war.attacker.id;
         const loser = isAttackerWinner ? war.defender : war.attacker;
         
         const hasAssetsInAttacker = currentWorkshops.some(w => w.kingdomName === war.attacker.name);
         const hasAssetsInDefender = currentWorkshops.some(w => w.kingdomName === war.defender.name);
         const isImmune = hasAssetsInAttacker && hasAssetsInDefender;

         if (isAttackerWinner && !isImmune) {
             const lostAssets = currentWorkshops.filter(w => w.kingdomName === loser.name);
             if (lostAssets.length > 0) {
                currentWorkshops = currentWorkshops.filter(w => w.kingdomName !== loser.name);
                currentLogs.push({ id: `loss-${war.id}`, turn: nextTurn, message: `${loser.name} düştü! mülkleriniz yağmalandı.`, type: 'danger' });
             }
             currentCompetitors.forEach(c => {
                c.workshops = c.workshops.filter(w => w.kingdomName !== loser.name);
             });
         }

         if (isAttackerWinner && war.playerSupportSide === 'attacker') {
            const reward = getRandomRewardAsset(loser.name, 'war-win-rew');
            currentWorkshops.push(reward);
            currentLogs.push({ id: `win-loot-${war.id}`, turn: nextTurn, message: `${winner.name} zaferiyle bir ${reward.type} ele geçirdiniz.`, type: 'success' });
         }

         updatedWars.push({ ...war, round: newRound, attackerStrength: newAttStr, defenderStrength: newDefStr, resolved: true, winnerId: winner.id });
      } else {
        updatedWars.push({ ...war, round: newRound, attackerStrength: newAttStr, defenderStrength: newDefStr });
      }
    }

    const warsStarting = Math.max(0, 2 - updatedWars.filter(w => !w.resolved).length);
    const maxNewWars = Math.min(warsStarting, 1); 
    const currentWarCount = updatedWars.filter(w => !w.resolved).length;
    let spawnChance = currentWarCount === 0 ? 0.15 : 0.05;

    if (maxNewWars > 0 && Math.random() < spawnChance) {
       const newWar = createWar(nextTurn, KINGDOMS);
       if (newWar) {
          updatedWars.push(newWar);
          currentLogs.push({ id: `new-war-${newWar.id}`, turn: nextTurn, message: `SAVAŞ! ${newWar.attacker.name}, ${newWar.defender.name} topraklarına girdi.`, type: 'danger' });
       }
    }

    setGameState(prev => ({
      ...prev,
      turn: nextTurn,
      gold: currentGold,
      weapons: currentWeapons,
      grain: currentGrain,
      medicine: currentMedicine,
      workshops: currentWorkshops,
      embargoes: currentEmbargoes,
      loans: currentLoans,
      loanRequests: currentLoanRequests,
      agents: currentAgents,
      competitors: currentCompetitors,
      rebellions: currentRebellions,
      market: currentMarket,
      wars: updatedWars,
      logs: currentLogs,
      isThinking: false
    }));
  };

  const relevantWars = gameState.wars.filter(w => {
     if (w.resolved) return false;
     const hasInAttacker = gameState.workshops.some(ws => ws.kingdomName === w.attacker.name);
     const hasInDefender = gameState.workshops.some(ws => ws.kingdomName === w.defender.name);
     const hasInvested = w.playerInvestmentTotal > 0;
     return hasInAttacker || hasInDefender || hasInvested;
  });
  
  const otherWarsCount = gameState.wars.filter(w => !w.resolved).length - relevantWars.length;

  return (
    <div className="h-screen w-screen bg-stone-950 text-stone-200 overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black -z-10"></div>

      {gameState.gameOver && (
         <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-stone-900 border-2 border-red-900 p-8 rounded-lg text-center max-w-md shadow-[0_0_50px_rgba(220,38,38,0.3)]">
               <Skull size={64} className="mx-auto text-red-600 mb-4" />
               <h1 className="text-4xl medieval-font text-red-500 mb-2">İFLAS ETTİNİZ</h1>
               <p className="text-stone-400 mb-6">Hazeniz tükendi.</p>
               <button onClick={handleReset} className="bg-red-900 hover:bg-red-800 text-stone-100 py-3 px-6 rounded border border-red-700 font-bold flex items-center justify-center gap-2 mx-auto transition-all">
                  <RotateCcw size={20} /> Yeniden Başlat
               </button>
            </div>
         </div>
      )}

      <div className="h-14 bg-stone-950 border-b border-stone-800 flex items-center justify-between px-4 z-30 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
           <div className="bg-amber-900/20 p-2 rounded-full border border-amber-900/50"><Landmark className="text-amber-500" /></div>
           <h1 className="text-xl medieval-font text-amber-500 hidden md:block">Ortaçağ Bankeri</h1>
        </div>
        <div className="flex items-center gap-2 bg-stone-900 p-1 rounded-lg border border-stone-800">
          <button onClick={() => setViewMode('table')} className={`p-2 rounded flex items-center gap-2 text-xs font-bold uppercase transition-colors ${viewMode === 'table' ? 'bg-stone-800 text-amber-500 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}><Table2 size={16} /> <span className="hidden sm:inline">Savaş Masası</span></button>
          <div className="w-px h-4 bg-stone-800"></div>
          <button onClick={() => setViewMode('map')} className={`p-2 rounded flex items-center gap-2 text-xs font-bold uppercase transition-colors ${viewMode === 'map' ? 'bg-stone-800 text-amber-500 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}><MapIcon size={16} /> <span className="hidden sm:inline">Dünya Haritası</span></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="p-2 text-stone-500 hover:text-red-400 transition-colors" title="Oyunu Sıfırla"><RotateCcw size={18} /></button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-stone-400"><Menu size={24} /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`fixed inset-0 z-40 md:static md:z-0 md:w-80 md:block transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
           <Portfolio 
              gold={gameState.gold} 
              weapons={gameState.weapons}
              grain={gameState.grain}
              medicine={gameState.medicine}
              reputation={gameState.reputation}
              workshops={gameState.workshops}
              embargoes={gameState.embargoes}
              loans={gameState.loans}
              loanRequests={gameState.loanRequests}
              agents={gameState.agents}
              competitors={gameState.competitors}
              market={gameState.market}
              wars={gameState.wars}
              turn={gameState.turn}
              onEndTurn={resolveTurn}
              onBuildAsset={buildAsset}
              onSellAsset={sellAsset}
              onHireAgent={hireAgent}
              onFireAgent={fireAgent}
              onAcceptLoan={acceptLoan}
              onRejectLoan={rejectLoan}
              onCollectDebt={collectDebt}
              onMarketTrade={handleMarketTrade}
              isThinking={gameState.isThinking}
              onClose={() => setIsMobileMenuOpen(false)}
           />
        </div>

        <div className="flex-1 bg-stone-950 relative overflow-hidden flex flex-col">
           <div className={`absolute inset-0 transition-opacity duration-500 ${viewMode === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <GameMap kingdoms={KINGDOMS} wars={gameState.wars} workshops={gameState.workshops} competitors={gameState.competitors} onSelectKingdom={(id) => console.log(id)} />
           </div>

           <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${viewMode === 'table' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className="flex-1 p-4 overflow-y-auto">
                 {relevantWars.length === 0 && gameState.rebellions.filter(r => !r.resolved).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-50">
                       <Globe size={64} className="mb-4" />
                       <h2 className="text-2xl medieval-font">Barış Hakim</h2>
                       <p>Dünyada sizi ilgilendiren büyük bir çatışma yok.</p>
                       {otherWarsCount > 0 && <p className="text-sm mt-2 text-stone-500">({otherWarsCount} adet uzak savaş sürüyor)</p>}
                    </div>
                 )}

                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {gameState.rebellions.filter(r => !r.resolved).map(reb => {
                       const hasAsset = gameState.workshops.some(w => w.kingdomName === reb.kingdom);
                       return (
                          <div key={reb.id} className="h-64"><RebellionCard rebellion={reb} hasAsset={hasAsset} playerGold={gameState.gold} onSupport={handleRebellionSupport} /></div>
                       );
                    })}
                    {relevantWars.map(war => {
                       const hasPresenceInAttacker = gameState.workshops.some(w => w.kingdomName === war.attacker.name);
                       const hasPresenceInDefender = gameState.workshops.some(w => w.kingdomName === war.defender.name);
                       return (
                          <div key={war.id} className="h-64"><WarCard war={war} playerGold={gameState.gold} playerWeapons={gameState.weapons} hasPresenceInAttacker={hasPresenceInAttacker} hasPresenceInDefender={hasPresenceInDefender} onSupport={handleWarSupport} /></div>
                       );
                    })}
                 </div>
                 {otherWarsCount > 0 && relevantWars.length > 0 && (
                    <div className="mt-8 text-center"><div className="inline-block bg-stone-900/50 px-4 py-2 rounded-full border border-stone-800 text-stone-500 text-xs"><Globe size={12} className="inline mr-2" /> Dünyanın geri kalanında {otherWarsCount} adet yerel savaş daha sürüyor (Yatırımınız yok).</div></div>
                 )}
              </div>
              <GameLog logs={gameState.logs} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;
