import { memo } from 'react';
import { MODE_DESCRIPTIONS } from '@/utils/gameUtils';

const GameLegend = memo(({ gameMode, className = '' }) => {
  const modeInfo = MODE_DESCRIPTIONS[gameMode];
  
  if (!modeInfo) return null;

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-2">{modeInfo.title}</h3>
      <p className="text-white/70 mb-3">{modeInfo.description}</p>
      
      <div className="space-y-1">
        {modeInfo.rules.map((rule, index) => (
          <div key={index} className="flex items-center text-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
            <span className="text-white/90">{rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

GameLegend.displayName = 'GameLegend';

export default GameLegend;