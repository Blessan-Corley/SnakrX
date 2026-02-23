import Card from '@/components/ui/Card';

const steps = [
  {
    title: 'Create Your Account',
    description: 'Sign up with your email, verify it with the OTP flow, and choose a unique username.'
  },
  {
    title: 'Choose a Game Mode',
    description: 'Start with Classic Mode to learn the basics, then try VS AI or Multiplayer for more challenge.'
  },
  {
    title: 'Master the Controls',
    description: 'Use WASD or Arrow Keys to control your snake. Eat food to grow and avoid hitting walls or yourself.'
  },
  {
    title: 'Unlock Achievements',
    description: 'Play games to unlock achievements and earn points. Check your progress in the Achievements section.'
  }
];

const ruleColumns = [
  [
    'Eat food (red squares) to grow your snake and increase your score',
    'Your snake moves continuously in the direction you choose',
    'Speed increases as you eat more food',
    'Press any key to start the round'
  ],
  [
    'In Classic, VS AI, and Multiplayer, walls are deadly',
    'Self collision ends the game in every mode',
    'You cannot reverse direction (no 180-degree turns)',
    'In VS AI and Multiplayer, bodies are ghosted - only head-to-head collisions end the round'
  ]
];

const GettingStartedHelpSection = () => (
  <div className="space-y-6">
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6">Getting Started with SnakrX</h2>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.title}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                {index + 1}
              </div>
              {step.title}
            </h3>
            <p className="text-white/70 ml-9">{step.description}</p>
          </div>
        ))}
      </div>
    </Card>

    <Card variant="glass" padding="lg">
      <h3 className="text-xl font-semibold text-white mb-4">Basic Game Rules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ruleColumns.map((rules, columnIndex) => (
          <div key={columnIndex} className="space-y-3">
            {rules.map((rule) => (
              <div key={rule} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${columnIndex === 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                <p className="text-white/70">{rule}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default GettingStartedHelpSection;
