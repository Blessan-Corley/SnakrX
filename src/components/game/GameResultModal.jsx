import { ArrowRight, Home, RotateCcw, Share2 } from 'lucide-react';
import Modal from '@/components/ui/Modal.jsx';
import Button from '@/components/ui/Button.jsx';
import { formatScore } from '@/utils/gameUtils.js';
import { PLAYER_SCORE_META } from './gamePageMeta.js';

const GameResultModal = ({
  isOpen,
  onClose,
  modalTitle,
  isVictory,
  isVsAiMode,
  isMultiplayerMode,
  userFinalScore,
  aiFinalScore,
  vsAiResultLabel,
  multiplayerWinner,
  multiplayerScoreRows,
  score,
  onRestart,
  onContinue,
  onShareScore,
  onQuit,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md" showCloseButton={false} closeOnBackdrop={false} closeOnEscape={false}>
    <div className="text-center space-y-6">
      <div className="bg-gradient-sunset/10 rounded-xl p-6 border border-primary-500/20">
        {isVsAiMode ? (
          <>
            <h3 className={`text-2xl font-bold mb-4 ${isVictory ? 'text-emerald-300' : 'text-rose-300'}`}>{vsAiResultLabel}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 uppercase tracking-wide">You</p>
                <p className="text-2xl font-bold text-white">{formatScore(userFinalScore)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 uppercase tracking-wide">AI</p>
                <p className="text-2xl font-bold text-orange-300">{formatScore(aiFinalScore)}</p>
              </div>
            </div>
          </>
        ) : isMultiplayerMode ? (
          <>
            <h3 className="text-2xl font-bold text-white mb-3">
              Winner: {multiplayerWinner ? multiplayerWinner.label : 'No Winner'}
            </h3>
            <div className="space-y-2 text-left">
              {multiplayerScoreRows.map((entry) => {
                const colorMeta = PLAYER_SCORE_META[entry.playerId] || PLAYER_SCORE_META[0];
                const isWinner = multiplayerWinner?.playerId === entry.playerId;
                return (
                  <div
                    key={entry.playerId}
                    className={`rounded-lg border px-3 py-2 flex items-center justify-between ${colorMeta.rowClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorMeta.dotClass}`} />
                      <span className={`text-sm ${entry.isAlive ? 'text-white' : 'text-gray-400 line-through'}`}>
                        {entry.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isWinner && (
                        <span className="text-[11px] uppercase tracking-wide text-primary-300">Winner</span>
                      )}
                      <span className="text-lg font-bold text-white">{formatScore(entry.score)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-white mb-4">Final Score</h3>
            <div className="text-4xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-4">{formatScore(score)}</div>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" icon={<RotateCcw size={18} />} onClick={onRestart} fullWidth>Play Again</Button>
        <Button variant="primary" icon={<ArrowRight size={18} />} onClick={onContinue} fullWidth>Continue</Button>
      </div>
      <Button variant="ghost-primary" icon={<Share2 size={18} />} onClick={onShareScore} fullWidth>Share Score</Button>
      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-white/10">
        <Button variant="minimal" icon={<Home size={16} />} onClick={onQuit}>Main Menu</Button>
      </div>
    </div>
  </Modal>
);

export default GameResultModal;
