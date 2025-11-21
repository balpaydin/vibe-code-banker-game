import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { ScrollText, Sparkles } from 'lucide-react';

interface GameLogProps {
  logs: LogEntry[];
}

const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col bg-stone-950 border-t border-stone-700 h-64 flex-shrink-0">
      <div className="bg-stone-900 p-2 px-4 border-b border-stone-800 flex items-center gap-2">
        <ScrollText size={16} className="text-stone-400" />
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Kraliyet Haberleri & Kayıtlar</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.map((log) => (
          <div key={log.id} className={`text-sm p-2 rounded border-l-2 ${
            log.type === 'success' ? 'border-green-600 bg-green-900/10 text-green-100' :
            log.type === 'danger' ? 'border-red-600 bg-red-900/10 text-red-100' :
            log.type === 'warning' ? 'border-amber-600 bg-amber-900/10 text-amber-100' :
            'border-stone-600 text-stone-300'
          }`}>
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold opacity-50 mt-0.5 whitespace-nowrap">Yıl {1200 + log.turn}</span>
              <div className="flex-1">
                {log.isGemini && <Sparkles size={12} className="inline mr-1 text-purple-400" />}
                {log.message}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default GameLog;