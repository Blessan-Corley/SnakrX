import Card from '@/components/ui/Card';

const commonIssues = [
  {
    problem: 'Game feels laggy or slow',
    solution: 'Try closing other browser tabs, check your internet connection, or restart your browser. Make sure hardware acceleration is enabled.'
  },
  {
    problem: 'Controls are not responding',
    solution: 'Click on the game area to ensure it has focus. Check that you\'re using the correct keys (WASD or Arrow keys).'
  },
  {
    problem: 'Can’t hear any sounds',
    solution: 'Check that sound is enabled in your profile settings and your browser/device volume is up. Some browsers require user interaction before playing audio.'
  },
  {
    problem: 'Game won’t load or shows errors',
    solution: 'Clear your browser cache, disable browser extensions, or try a different browser. Ensure JavaScript is enabled.'
  },
  {
    problem: 'Progress not saving',
    solution: 'Check your internet connection and ensure you\'re logged in. Your progress is automatically saved when online.'
  },
  {
    problem: 'Multiplayer not working on mobile',
    solution: 'Multiplayer mode requires a desktop or laptop for the best experience with multiple players and proper controls.'
  }
];

const TroubleshootingHelpSection = () => (
  <div className="space-y-6">
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6">Troubleshooting</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Common Issues</h3>
          <div className="space-y-4">
            {commonIssues.map((item) => (
              <div key={item.problem} className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2"> {item.problem}</h4>
                <p className="text-white/70"> {item.solution}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Browser Compatibility</h3>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 mb-3">SnakrX works best on modern browsers with WebGL support:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="text-green-400"> Chrome 80+</div>
              <div className="text-green-400"> Firefox 75+</div>
              <div className="text-green-400"> Safari 13+</div>
              <div className="text-green-400"> Edge 80+</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Performance Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2"> Optimize Performance</h4>
              <ul className="text-white/70 space-y-1">
                <li> Close unnecessary browser tabs</li>
                <li> Enable hardware acceleration</li>
                <li> Use a stable internet connection</li>
                <li> Keep your browser updated</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2"> Mobile Optimization</h4>
              <ul className="text-white/70 space-y-1">
                <li> Use landscape orientation</li>
                <li> Close background apps</li>
                <li> Ensure stable WiFi</li>
                <li> Use touch controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default TroubleshootingHelpSection;
