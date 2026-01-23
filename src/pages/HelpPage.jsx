import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Gamepad2,
  Target,
  Award,
  Settings,
  Mail,
  ChevronDown,
  Keyboard,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react';

import Card from '@/components/ui/Card';
import { playClick } from '@/utils/sound';
import { isMobile } from '@/utils/gameUtils';

/**
 * Help & Support Page
 * Comprehensive help documentation for SnakrX
 */
const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const mobile = isMobile();

  // Help sections
  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Gamepad2 size={20} />,
      color: 'text-green-400'
    },
    {
      id: 'game-modes',
      title: 'Game Modes',
      icon: <Target size={20} />,
      color: 'text-blue-400'
    },
    {
      id: 'controls',
      title: 'Controls',
      icon: <Keyboard size={20} />,
      color: 'text-purple-400'
    },
    {
      id: 'achievements',
      title: 'Achievements',
      icon: <Award size={20} />,
      color: 'text-yellow-400'
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: <Settings size={20} />,
      color: 'text-orange-400'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <Shield size={20} />,
      color: 'text-red-400'
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How do I start playing SnakrX?",
      answer: "Simply create an account, choose a game mode from the main menu, and start playing! Classic mode is perfect for beginners."
    },
    {
      question: "What are the different difficulty levels in VS AI mode?",
      answer: "Easy (65% AI optimality), Medium (80% optimality), and Impossible (100% optimality with perfect pathfinding). Higher difficulties give more points per food."
    },
    {
      question: "Can I play multiplayer on mobile?",
      answer: "Multiplayer mode is currently only available on desktop/laptop devices for the best experience with multiple players and proper controls."
    },
    {
      question: "How do achievements work?",
      answer: "Achievements are unlocked automatically as you play. They have different tiers (Common, Uncommon, Rare, Epic, Legendary) and award points that contribute to your overall ranking."
    },
    {
      question: "Can I change my username?",
      answer: "Currently, usernames cannot be changed after account creation. However, you can update your display name in your profile settings."
    },
    {
      question: "Is my game progress saved?",
      answer: "Yes! All your statistics, achievements, and progress are automatically saved to your account and synced across devices."
    },
    {
      question: "Why can't I hear any sounds?",
      answer: "Check if sound is enabled in your profile settings. Also ensure your browser allows audio and your device volume is up."
    }
  ];

  // Handle section navigation
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    playClick();
  };

  // Handle FAQ expansion
  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
    playClick();
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <HelpCircle className="inline mr-3" size={48} />
            Help & Support
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Everything you need to know about SnakrX
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="glass" padding="sm">
              <h3 className="text-lg font-semibold text-white mb-4">Topics</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                      ${activeSection === section.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <span className={section.color}>{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </Card>

            {/* Quick Contact */}
            <Card variant="glass" padding="sm" className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Need More Help?</h3>
              <p className="text-white/70 text-sm mb-4">
                Can&apos;t find what you&apos;re looking for? Get in touch!
              </p>
              <a
                href="mailto:blessancorley@gmail.com?subject=SnakrX Support"
                className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Mail size={16} />
                <span>Contact Support</span>
              </a>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Getting Started */}
                {activeSection === 'getting-started' && (
                  <div className="space-y-6">
                    <Card variant="glass" padding="lg">
                      <h2 className="text-2xl font-bold text-white mb-6">Getting Started with SnakrX</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</div>
                            Create Your Account
                          </h3>
                          <p className="text-white/70 ml-9">
                            Sign up with your email and choose a unique username. You&apos;ll also set up a security question for account recovery.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</div>
                            Choose a Game Mode
                          </h3>
                          <p className="text-white/70 ml-9">
                            Start with Classic Mode to learn the basics, then try VS AI or Multiplayer for more challenge.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</div>
                            Master the Controls
                          </h3>
                          <p className="text-white/70 ml-9">
                            Use WASD or Arrow Keys to control your snake. Eat food to grow and avoid hitting walls or yourself.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">4</div>
                            Unlock Achievements
                          </h3>
                          <p className="text-white/70 ml-9">
                            Play games to unlock achievements and earn points. Check your progress in the Achievements section.
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Game Rules */}
                    <Card variant="glass" padding="lg">
                      <h3 className="text-xl font-semibold text-white mb-4">Basic Game Rules</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-white/70">Eat food (red squares) to grow your snake and increase your score</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-white/70">Your snake moves continuously in the direction you choose</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-white/70">Speed increases as you eat more food</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-white/70">Don&apos;t hit the walls or your own body</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-white/70">You cannot reverse direction (no 180° turns)</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-white/70">In multiplayer, avoid other players&apos; snakes</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Game Modes */}
                {activeSection === 'game-modes' && (
                  <div className="space-y-6">
                    <Card variant="glass" padding="lg">
                      <h2 className="text-2xl font-bold text-white mb-6">Game Modes</h2>
                      
                      {/* Classic Mode */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-green-400 mb-3 flex items-center">
                          <div className="text-2xl mr-3">🎮</div>
                          Classic Mode
                        </h3>
                        <p className="text-white/70 mb-4">
                          The traditional snake experience with endless gameplay. Perfect for beginners and high score challenges.
                        </p>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2">Features:</h4>
                          <ul className="text-white/70 space-y-1">
                            <li>• Endless gameplay until you crash</li>
                            <li>• Progressive speed increase</li>
                            <li>• 5 points per food item</li>
                            <li>• Personal best tracking</li>
                            <li>• Achievement unlocks</li>
                          </ul>
                        </div>
                      </div>

                      {/* VS AI Mode */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center">
                          <div className="text-2xl mr-3">🤖</div>
                          VS AI Mode
                        </h3>
                        <p className="text-white/70 mb-4">
                          Battle against intelligent AI opponents with advanced pathfinding algorithms.
                        </p>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2">Difficulty Levels:</h4>
                          <div className="space-y-2 text-white/70">
                            <div className="flex justify-between">
                              <span>🟢 Easy (65% AI optimality)</span>
                              <span>5 points per food</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🟡 Medium (80% AI optimality)</span>
                              <span>10 points per food</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🔴 Impossible (100% AI optimality)</span>
                              <span>20 points per food</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multiplayer Mode */}
                      <div>
                        <h3 className="text-xl font-semibold text-purple-400 mb-3 flex items-center">
                          <div className="text-2xl mr-3">👥</div>
                          Multiplayer Mode
                        </h3>
                        <p className="text-white/70 mb-4">
                          Local multiplayer battles with up to 4 players on one screen. {mobile && '(Desktop only)'}
                        </p>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2">Features:</h4>
                          <ul className="text-white/70 space-y-1">
                            <li>• 2-4 players on one device</li>
                            <li>• Different control schemes for each player</li>
                            <li>• Last snake standing wins</li>
                            <li>• Competitive scoring</li>
                            <li>• {mobile ? 'Requires desktop/laptop' : 'Full keyboard support'}</li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Controls */}
                {activeSection === 'controls' && (
                  <div className="space-y-6">
                    <Card variant="glass" padding="lg">
                      <h2 className="text-2xl font-bold text-white mb-6">Game Controls</h2>
                      
                      {/* Keyboard Controls */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                          <Keyboard className="mr-3 text-purple-400" size={24} />
                          Keyboard Controls
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Single Player */}
                          <div className="bg-white/5 rounded-lg p-4">
                            <h4 className="font-semibold text-white mb-3">Single Player</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">Move Up:</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">W or ↑</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Move Down:</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">S or ↓</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Move Left:</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">A or ←</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Move Right:</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">D or →</span>
                              </div>
                            </div>
                          </div>

                          {/* Game Controls */}
                          <div className="bg-white/5 rounded-lg p-4">
                            <h4 className="font-semibold text-white mb-3">Game Controls</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">Pause/Resume:</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">Space</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Restart:</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">R</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Quit to Menu:</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">Esc</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Multiplayer Controls */}
                        {!mobile && (
                          <div className="mt-6">
                            <h4 className="font-semibold text-white mb-3">Multiplayer Controls</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                { player: 1, keys: 'WASD', color: 'text-green-400' },
                                { player: 2, keys: 'Arrow Keys', color: 'text-blue-400' },
                                { player: 3, keys: 'IJKL', color: 'text-yellow-400' },
                                { player: 4, keys: 'Numpad', color: 'text-red-400' }
                              ].map((control) => (
                                <div key={control.player} className="bg-white/5 rounded-lg p-3 text-center">
                                  <div className={`font-semibold ${control.color} mb-2`}>
                                    Player {control.player}
                                  </div>
                                  <div className="text-white font-mono text-sm">
                                    {control.keys}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Controls */}
                      {mobile && (
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <Smartphone className="mr-3 text-cyan-400" size={24} />
                            Mobile Controls
                          </h3>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-white/70 mb-4">
                              On mobile devices, you can use the on-screen directional buttons that appear during gameplay.
                            </p>
                            <div className="space-y-2">
                              <div>• Tap the directional buttons to move your snake</div>
                              <div>• Tap the pause button to pause the game</div>
                              <div>• Use the game menu for restart and quit options</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* Achievements */}
                {activeSection === 'achievements' && (
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

                        {/* Achievement Tiers */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Achievement Tiers</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                              { tier: 'Common', color: 'text-gray-400', points: '5-15', icon: '⭐' },
                              { tier: 'Uncommon', color: 'text-green-400', points: '20-35', icon: '🌟' },
                              { tier: 'Rare', color: 'text-blue-400', points: '40-60', icon: '💫' },
                              { tier: 'Epic', color: 'text-purple-400', points: '70-90', icon: '✨' },
                              { tier: 'Legendary', color: 'text-amber-400', points: '100+', icon: '👑' }
                            ].map((tier) => (
                              <div key={tier.tier} className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-2xl mb-2">{tier.icon}</div>
                                <div className={`font-semibold ${tier.color} mb-1`}>{tier.tier}</div>
                                <div className="text-white/60 text-sm">{tier.points} pts</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Achievement Categories */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { name: 'Gameplay', icon: '🎮', desc: 'Basic game milestones' },
                              { name: 'High Scores', icon: '🏆', desc: 'Score-based achievements' },
                              { name: 'Survival', icon: '⏰', desc: 'Time-based challenges' },
                              { name: 'Speed Demon', icon: '⚡', desc: 'Speed-related feats' },
                              { name: 'AI Destroyer', icon: '🤖', desc: 'VS AI victories' },
                              { name: 'Social Player', icon: '👥', desc: 'Multiplayer achievements' }
                            ].map((category) => (
                              <div key={category.name} className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="text-2xl">{category.icon}</div>
                                  <div>
                                    <div className="font-semibold text-white">{category.name}</div>
                                    <div className="text-white/60 text-sm">{category.desc}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Account & Settings */}
                {activeSection === 'account' && (
                  <div className="space-y-6">
                    <Card variant="glass" padding="lg">
                      <h2 className="text-2xl font-bold text-white mb-6">Account & Settings</h2>
                      
                      <div className="space-y-8">
                        {/* Account Management */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Account Management</h3>
                          <div className="space-y-4">
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="font-semibold text-white mb-2">Updating Your Profile</h4>
                              <p className="text-white/70">
                                You can update your display name and game preferences in the Profile section. 
                                Your username cannot be changed after account creation.
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="font-semibold text-white mb-2">Password Recovery</h4>
                              <p className="text-white/70">
                                If you forget your password, use the &quot;Forgot Password&quot; link on the login page.
                                You&apos;ll need to answer your security question to reset it.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Game Settings */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Game Settings</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="font-semibold text-white mb-2 flex items-center">
                                <Zap className="mr-2" size={16} />
                                Audio Settings
                              </h4>
                              <ul className="text-white/70 space-y-1">
                                <li>• Toggle sound effects on/off</li>
                                <li>• Adjust volume levels</li>
                                <li>• Individual sound controls</li>
                              </ul>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="font-semibold text-white mb-2 flex items-center">
                                <Gamepad2 className="mr-2" size={16} />
                                Game Preferences
                              </h4>
                              <ul className="text-white/70 space-y-1">
                                <li>• Set favorite game mode</li>
                                <li>• Display preferences</li>
                                <li>• Privacy settings</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Data & Privacy */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Data & Privacy</h3>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-white/70 mb-3">
                              Your game data is securely stored and synced across devices. We collect:
                            </p>
                            <ul className="text-white/70 space-y-1">
                              <li>• Game statistics and achievements</li>
                              <li>• Account information (email, username)</li>
                              <li>• Game preferences and settings</li>
                            </ul>
                            <p className="text-white/60 text-sm mt-3">
                              See our Privacy Policy for complete details on data handling.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Troubleshooting */}
                {activeSection === 'troubleshooting' && (
                  <div className="space-y-6">
                    <Card variant="glass" padding="lg">
                      <h2 className="text-2xl font-bold text-white mb-6">Troubleshooting</h2>
                      
                      <div className="space-y-6">
                        {/* Common Issues */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Common Issues</h3>
                          <div className="space-y-4">
                            {[
                              {
                                problem: "Game feels laggy or slow",
                                solution: "Try closing other browser tabs, check your internet connection, or restart your browser. Make sure hardware acceleration is enabled."
                              },
                              {
                                problem: "Controls are not responding",
                                solution: "Click on the game area to ensure it has focus. Check that you're using the correct keys (WASD or Arrow keys)."
                              },
                              {
                                problem: "Can't hear any sounds",
                                solution: "Check that sound is enabled in your profile settings and your browser/device volume is up. Some browsers require user interaction before playing audio."
                              },
                              {
                                problem: "Game won't load or shows errors",
                                solution: "Clear your browser cache, disable browser extensions, or try a different browser. Ensure JavaScript is enabled."
                              },
                              {
                                problem: "Progress not saving",
                                solution: "Check your internet connection and ensure you're logged in. Your progress is automatically saved when online."
                              },
                              {
                                problem: "Multiplayer not working on mobile",
                                solution: "Multiplayer mode requires a desktop or laptop for the best experience with multiple players and proper controls."
                              }
                            ].map((item, index) => (
                              <div key={index} className="bg-white/5 rounded-lg p-4">
                                <h4 className="font-semibold text-white mb-2">❓ {item.problem}</h4>
                                <p className="text-white/70">💡 {item.solution}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Browser Compatibility */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Browser Compatibility</h3>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-white/70 mb-3">SnakrX works best on modern browsers with WebGL support:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                              <div className="text-green-400">✅ Chrome 80+</div>
                              <div className="text-green-400">✅ Firefox 75+</div>
                              <div className="text-green-400">✅ Safari 13+</div>
                              <div className="text-green-400">✅ Edge 80+</div>
                            </div>
                          </div>
                        </div>

                        {/* Performance Tips */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Performance Tips</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="font-semibold text-white mb-2">🚀 Optimize Performance</h4>
                              <ul className="text-white/70 space-y-1">
                                <li>• Close unnecessary browser tabs</li>
                                <li>• Enable hardware acceleration</li>
                                <li>• Use a stable internet connection</li>
                                <li>• Keep your browser updated</li>
                              </ul>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="font-semibold text-white mb-2">📱 Mobile Optimization</h4>
                              <ul className="text-white/70 space-y-1">
                                <li>• Use landscape orientation</li>
                                <li>• Close background apps</li>
                                <li>• Ensure stable WiFi</li>
                                <li>• Use touch controls</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* FAQ Section */}
            <Card variant="glass" padding="lg" className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="font-medium text-white">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={20} className="text-white/60" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4 text-white/70 border-t border-white/10">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;