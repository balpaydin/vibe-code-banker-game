
export enum KingdomType {
  NORTH = 'Kuzey Krallığı',
  SOUTH = 'Güney İmparatorluğu',
  EAST = 'Doğu Sultanlığı',
  WEST = 'Batı Dükalığı',
  HIGHLAND = 'Dağ Klanları',
  ISLAND = 'Ada Korsanları',
  VALLEY = 'Vadi Prensliği',
  RIVER = 'Nehir Baronluğu',
  DESERT = 'Çöl Göçebeleri',
  ICE = 'Buz Diyarı',
  FOREST = 'Orman Birliği',
  SWAMP = 'Bataklık Krallığı',
  IRON = 'Demir Tepeler',
  GOLD = 'Altın Kıyılar',
  STORM = 'Fırtına Burnu',
  CRYSTAL = 'Kristal Şehir',
  VOLCANO = 'Volkanik Topraklar',
  STEPPE = 'Bozkır Hanlığı',
  SECRET = 'Gizli Vadi',
  TRADE = 'Ticaret Ligi'
}

export enum AssetType {
  FARM = 'Çiftlik',
  MINE = 'Maden Ocağı',
  WEAPONSMITH = 'Silah Atölyesi',
  BANK = 'Bankerlik Ofisi'
}

export interface Kingdom {
  id: string;
  name: KingdomType;
  strength: number; // Base military strength
  color: string;
  lastWarTurn: number; // Turn number when they last entered a war
}

export interface War {
  id: string;
  attacker: Kingdom;
  defender: Kingdom;
  description: string;
  
  // Dynamic War Stats
  round: number; // Current round (max 4)
  attackerStrength: number; // Current strength (Goal 90)
  defenderStrength: number; // Current strength (Goal 90)
  
  // Player Stats
  playerSupportSide: 'attacker' | 'defender' | null;
  playerInvestmentTotal: number; // Total value (strategic influence)
  goldSaturation: number; 
  resolved: boolean;
  winnerId?: string;
  competitorLog?: {
    competitorName: string;
    side: 'attacker' | 'defender';
    amount: number;
  }[];
}

export interface Rebellion {
  id: string;
  kingdom: KingdomType;
  strength: number; // 0-100. >50 succeeds usually.
  duration: number; // Current turn count. Max 5.
  supportSide: 'rebels' | 'crown' | null; 
  playerInvestment: number;
  resolved: boolean;
  success?: boolean;
}

export interface Embargo {
  kingdom: KingdomType;
  untilTurn: number;
}

export interface Agent {
  id: string;
  name: string;
  type: 'Thug' | 'Mercenary' | 'Assassin';
  intimidation: number; // 1-100 success chance modifier
  costPerTurn: number; // Upkeep
  isBusy: boolean;
}

export interface LoanRequest {
  id: string;
  kingdom: KingdomType;
  borrowerName: string;
  amount: number;
  offeredInterest: number; // 0.2 for 20%
  duration: number;
  expiresIn: number; // Turns until request disappears
}

export interface Loan {
  id: string;
  kingdom: KingdomType;
  borrowerName: string;
  principal: number;
  interestRate: number; 
  totalDue: number;
  dueTurn: number;
  status: 'active' | 'paid' | 'defaulted' | 'collected' | 'lost';
  failedCollectionAttempts: number;
}

export interface Workshop {
  id: string;
  type: AssetType;
  kingdomName: KingdomType;
  productionRate: number; 
  goldIncome: number; 
  maintenance: number; 
}

export interface Competitor {
  id: string;
  name: string;
  color: string;
  gold: number;
  workshops: Workshop[];
  personality: 'aggressive' | 'conservative' | 'balanced';
}

export interface LogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'info' | 'success' | 'danger' | 'warning' | 'rival';
  isGemini?: boolean;
}

export interface MarketState {
  price: number;
  stock: number;
  trend: 'up' | 'down' | 'stable';
}

export interface GameState {
  gold: number;
  weapons: number;
  turn: number;
  reputation: number;
  workshops: Workshop[];
  wars: War[];
  rebellions: Rebellion[];
  embargoes: Embargo[];
  loans: Loan[];
  loanRequests: LoanRequest[];
  agents: Agent[];
  competitors: Competitor[];
  market: MarketState;
  logs: LogEntry[];
  isThinking: boolean;
  gameOver: boolean;
}
