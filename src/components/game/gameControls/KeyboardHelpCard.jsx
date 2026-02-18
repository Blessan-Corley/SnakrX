import Card from '@/components/ui/Card.jsx';

const KeyboardHelpCard = () => (
  <Card variant="glass" padding="sm">
    <h4 className="text-sm font-semibold text-white mb-3">Keyboard</h4>
    <div className="text-xs text-white/70 space-y-1">
      <div>- Arrow Keys or WASD: Move</div>
      <div>- Space: Pause/Resume</div>
      <div>- R: Restart Game</div>
      <div>- ESC: Quit to Menu</div>
    </div>
  </Card>
);

export default KeyboardHelpCard;
