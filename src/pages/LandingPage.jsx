import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Play, 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  Smartphone, 
  ArrowRight,
  Star,
  GamepadIcon,
  Target,
  Award
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { playClick } from '@/utils/sound';

/**
 * Beautiful Landing Page for SnakrX
 * Features hero section, features, testimonials, and call-to-action
 */
const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Mouse move effect for hero background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Features data
  const features = [
    {
      icon: <GamepadIcon size={24} />,
      title: "Classic Mode",
      description: "Experience the timeless snake game with modern polish and smooth controls.",
      gradient: "from-green-400 to-emerald-600"
    },
    {
      icon: <Target size={24} />,
      title: "VS AI Challenge",
      description: "Battle against intelligent AI with Easy, Medium, and Impossible difficulty levels.",
      gradient: "from-blue-400 to-cyan-600"
    },
    {
      icon: <Users size={24} />,
      title: "Multiplayer Fun",
      description: "Compete with friends locally in intense multiplayer snake battles.",
      gradient: "from-purple-400 to-pink-600"
    },
    {
      icon: <Award size={24} />,
      title: "Achievement System",
      description: "Unlock achievements, earn points, and show off your gaming prowess.",
      gradient: "from-amber-400 to-orange-600"
    },
    {
      icon: <Trophy size={24} />,
      title: "Global Leaderboards",
      description: "Compete for the top spot and see how you rank against players worldwide.",
      gradient: "from-red-400 to-rose-600"
    },
    {
      icon: <Zap size={24} />,
      title: "Lightning Fast",
      description: "Optimized performance with smooth 60fps gameplay and responsive controls.",
      gradient: "from-yellow-400 to-amber-600"
    }
  ];

  // Game stats
  const stats = [
    { number: "3", label: "Game Modes", icon: <GamepadIcon size={20} /> },
    { number: "50+", label: "Achievements", icon: <Award size={20} /> },
    { number: "∞", label: "Fun Factor", icon: <Zap size={20} /> },
    { number: "100%", label: "Free to Play", icon: <Star size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(249, 115, 22, 0.2) 0%, transparent 50%)`
          }}
        />
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-50 px-6 py-4"
      >
        <div className="container mx-auto flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="text-3xl"
            >
              🐍
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                SnakrX
              </h1>
              <p className="text-xs text-white/50">Modern Snake Gaming</p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" onClick={() => playClick()}>
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" onClick={() => playClick()}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity }}
        className="relative z-10 px-6 py-20 text-center"
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-sunset bg-clip-text text-transparent">
                Snake Game
              </span>
              <br />
              <span className="text-white">
                Reimagined
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Experience the classic snake game like never before. 
              Challenge AI, compete with friends, and unlock achievements 
              in this premium gaming experience.
            </p>
          </motion.div>

          {/* Hero Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          >
            <Link to="/register">
              <Button 
                variant="primary" 
                size="lg" 
                icon={<Play size={20} />}
                onClick={() => playClick()}
                className="text-lg px-8 py-4"
              >
                Start Playing
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="ghost-primary" 
                size="lg"
                onClick={() => playClick()}
                className="text-lg px-8 py-4"
              >
                Sign In to Continue
              </Button>
            </Link>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="flex items-center justify-center space-x-1 text-white/70">
                  {stat.icon}
                  <span className="text-sm">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        style={{ y: y2 }}
        className="relative z-10 px-6 py-20"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Game Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Discover what makes SnakrX the ultimate snake gaming experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  variant="glass" 
                  hover={true}
                  className="h-full text-center group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`
                      w-16 h-16 mx-auto mb-4 rounded-2xl 
                      bg-gradient-to-br ${feature.gradient}
                      flex items-center justify-center text-white
                      shadow-lg group-hover:shadow-xl transition-shadow duration-300
                    `}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Game Modes Preview */}
      <motion.section className="relative z-10 px-6 py-20 bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your Challenge
            </h2>
            <p className="text-xl text-white/70">
              Three exciting game modes to test your skills
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Classic Mode",
                description: "Pure snake gameplay with increasing speed and endless fun",
                icon: "🎮",
                color: "from-green-400 to-emerald-600"
              },
              {
                title: "VS AI",
                description: "Battle against intelligent AI opponents with 3 difficulty levels",
                icon: "🤖",
                color: "from-blue-400 to-cyan-600"
              },
              {
                title: "Multiplayer",
                description: "Local multiplayer battles with up to 4 players on one screen",
                icon: "👥",
                color: "from-purple-400 to-pink-600"
              }
            ].map((mode, index) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card variant="glass" className="text-center h-full">
                  <div className="text-6xl mb-4">{mode.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {mode.title}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {mode.description}
                  </p>
                  <div className={`
                    h-2 rounded-full bg-gradient-to-r ${mode.color}
                    animate-pulse
                  `} />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Technical Features */}
      <motion.section className="relative z-10 px-6 py-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built for Performance
            </h2>
            <p className="text-xl text-white/70">
              Modern web technologies for the best gaming experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Zap size={32} />,
                title: "Lightning Fast",
                description: "60fps smooth gameplay with optimized rendering and minimal latency"
              },
              {
                icon: <Smartphone size={32} />,
                title: "Cross-Platform",
                description: "Play on any device with responsive design and touch controls"
              },
              {
                icon: <Shield size={32} />,
                title: "Secure & Private",
                description: "Your data is protected with enterprise-grade security measures"
              },
              {
                icon: <Trophy size={32} />,
                title: "Achievement System",
                description: "Track your progress with comprehensive stats and unlock rewards"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-sunset rounded-2xl flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section className="relative z-10 px-6 py-20 text-center">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Gaming?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of players enjoying the ultimate snake gaming experience
            </p>
            <Link to="/register">
              <Button 
                variant="primary" 
                size="xl" 
                icon={<ArrowRight size={24} />}
                iconPosition="right"
                onClick={() => playClick()}
                className="text-xl px-12 py-6"
              >
                Play SnakrX Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="text-2xl">🐍</div>
              <div>
                <h3 className="font-bold text-white">SnakrX</h3>
                <p className="text-sm text-white/50">Modern Snake Gaming</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-white/70">
              <Link 
                to="/privacy" 
                className="hover:text-white transition-colors"
                onClick={() => playClick()}
              >
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className="hover:text-white transition-colors"
                onClick={() => playClick()}
              >
                Terms
              </Link>
              <a 
                href="mailto:blessancorley@gmail.com"
                className="hover:text-white transition-colors"
                onClick={() => playClick()}
              >
                Contact
              </a>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-6 pt-6 text-center">
            <p className="text-white/50 text-sm">
              © 2024 SnakrX. Designed & Built with ❤️ by Blessan Corley
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;