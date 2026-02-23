import Card from '@/components/ui/Card';

const tiers = [
  { tier: 'Common', color: 'text-gray-400', points: '5-15' },
  { tier: 'Uncommon', color: 'text-green-400', points: '20-35' },
  { tier: 'Rare', color: 'text-blue-400', points: '40-60' },
  { tier: 'Epic', color: 'text-purple-400', points: '70-90' },
  { tier: 'Legendary', color: 'text-amber-400', points: '100+' }
];

const categories = [
  { name: 'Gameplay', desc: 'Basic game milestones' },
  { name: 'High Scores', desc: 'Score-based achievements' },
  { name: 'Survival', desc: 'Time-based challenges' },
  { name: 'Speed Demon', desc: 'Speed-related feats' },
  { name: 'AI Destroyer', desc: 'VS AI victories' },
  { name: 'Social Player', desc: 'Multiplayer achievements' }
];

const AchievementsHelpSection = () => (
  <div className="space-y-6">
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6">Achievement System</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">How Achievements Work</h3>
          <p className="text-white/70 mb-4">
            Achievements are automatically unlocked as you play and meet specific requirements.
            Each achievement awards points that contribute to your overall ranking.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Achievement Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {tiers.map((tier) => (
              <div key={tier.tier} className="bg-white/5 rounded-lg p-4 text-center">
                <div className={`font-semibold ${tier.color} mb-1`}>{tier.tier}</div>
                <div className="text-white/60 text-sm">{tier.points} pts</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="bg-white/5 rounded-lg p-4">
                <div className="font-semibold text-white">{category.name}</div>
                <div className="text-white/60 text-sm">{category.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default AchievementsHelpSection;
