import { Gamepad2 } from 'lucide-react';
import { PLAYER_READY_META } from './gamePageMeta.js';

const GameReadyOverlay = ({
  gameStatus,
  gameStates,
  isMultiplayerMode,
  numPlayers,
  multiplayerReadyPlayers,
  readyPlayersCount,
  resolvedMode,
  modeDescriptions,
}) => {
  if (gameStatus !== gameStates.READY) {
    return null;
  }

  const rules = modeDescriptions[resolvedMode]?.rules || ['Avoid walls and your own body', 'Collect food to grow'];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg">
      {isMultiplayerMode ? (
        <div className="w-full max-w-2xl px-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white mb-1">Multiplayer Ready Check</h2>
            <p className="text-sm text-white/70">
              Press your movement key to mark ready. Game starts when all players are ready.
            </p>
            <p className="text-xs text-primary-300 mt-2">
              Ready: {readyPlayersCount}/{numPlayers}
            </p>
          </div>
          <div className={`grid gap-3 ${numPlayers > 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {Array.from({ length: numPlayers }, (_, index) => {
              const meta = PLAYER_READY_META[index] || PLAYER_READY_META[0];
              const isReady = multiplayerReadyPlayers[index] === true;
              return (
                <div
                  key={meta.id}
                  className={`border rounded-xl p-3 transition-all duration-200 ${meta.badgeClass}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <span className={`text-xs font-semibold ${isReady ? 'text-emerald-300' : 'text-white/60'}`}>
                      {isReady ? 'Ready' : 'Waiting'}
                    </span>
                  </div>
                  <p className="text-xs text-white/80">Controls: {meta.controls}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 max-w-lg mx-auto text-left bg-white/5 border border-white/10 rounded-xl p-3">
            <h3 className="text-sm font-semibold text-white/80 mb-2">Quick Rules</h3>
            <ul className="space-y-1 text-xs text-white/70">
              {rules.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-400 mr-2">-</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center px-4">
          <div className="flex justify-center mb-4 animate-bounce">
            <Gamepad2 size={48} className="text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Get Ready!</h2>
          <p className="text-base text-white/80 mb-4">Press any key to start</p>
          <div className="max-w-sm mx-auto text-left bg-white/5 border border-white/10 rounded-xl p-3">
            <h3 className="text-sm font-semibold text-white/80 mb-2">Quick Rules</h3>
            <ul className="space-y-1 text-xs text-white/70">
              {rules.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-400 mr-2">-</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameReadyOverlay;
