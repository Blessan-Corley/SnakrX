import Card from '@/components/ui/Card';

const GameModesHelpSection = ({ mobile }) => (
  <div className="space-y-6">
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6">Game Modes</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-400 mb-3">Classic Mode</h3>
        <p className="text-white/70 mb-4">
          The traditional snake experience with endless gameplay. Perfect for beginners and high score challenges.
        </p>
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Features:</h4>
          <ul className="text-white/70 space-y-1">
            <li> Endless gameplay until you crash</li>
            <li> Progressive speed increase</li>
            <li> 5 points per food item</li>
            <li> Personal best tracking</li>
            <li> Achievement unlocks</li>
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-sky-400 mb-3">Transparent Mode</h3>
        <p className="text-white/70 mb-4">
          A classic variant where the snake wraps through walls. Great for precision play.
        </p>
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Rules:</h4>
          <ul className="text-white/70 space-y-1">
            <li> Passing through walls wraps you to the opposite side</li>
            <li> Self collision still ends the game</li>
            <li> Body collisions still end the game</li>
            <li> Same speed curve as Classic</li>
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-400 mb-3">VS AI Mode</h3>
        <p className="text-white/70 mb-4">
          Battle against intelligent AI opponents with advanced pathfinding algorithms. Bodies are ghosted - only head-to-head collisions end the round.
        </p>
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Difficulty Levels:</h4>
          <div className="space-y-2 text-white/70">
            <div className="flex justify-between">
              <span> Easy (Beginner-friendly)</span>
              <span>5 points per food</span>
            </div>
            <div className="flex justify-between">
              <span> Medium (Balanced challenge)</span>
              <span>10 points per food</span>
            </div>
            <div className="flex justify-between">
              <span> Impossible (Maximum pressure)</span>
              <span>20 points per food</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-purple-400 mb-3">Multiplayer Mode</h3>
        <p className="text-white/70 mb-4">
          Local multiplayer battles with up to 4 players on one screen. {mobile && '(Desktop only)'}
        </p>
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Features:</h4>
          <ul className="text-white/70 space-y-1">
            <li> 2-4 players on one device</li>
            <li> Different control schemes for each player</li>
            <li> Bodies are ghosted - head-to-head collisions decide knockouts</li>
            <li> Last snake standing wins</li>
            <li> Competitive scoring</li>
            <li> {mobile ? 'Requires desktop/laptop' : 'Full keyboard support'}</li>
          </ul>
        </div>
      </div>
    </Card>
  </div>
);

export default GameModesHelpSection;
