# 🐍 SnakrX - The Ultimate Snake Game Experience

[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase Backend](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

> **A modern, feature-rich Snake game with multiplayer support, AI opponents, achievements, and real-time leaderboards!**

![SnakrX Game Preview](https://via.placeholder.com/800x400/10b981/ffffff?text=SnakrX+Game+Preview)

## 🎮 Features

### 🎯 **Game Modes**
- **🏆 Classic Mode** - The traditional snake experience with modern enhancements
- **🤖 VS AI Mode** - Challenge intelligent AI opponents with 3 difficulty levels
- **👥 Multiplayer Mode** - Local multiplayer for up to 4 players
- **🌟 Transparent Mode** - Walls don't kill you, wrap around the board!

### ⚡ **Enhanced Gameplay**
- **Super Responsive Controls** - 30ms input response time for precise movement
- **Multi-Key Protection** - No more accidental deaths from button mashing
- **Smooth Progressive Speed** - Starts slow (1.0x) and gradually increases
- **Smart Input Buffering** - Perfect corner turns and rapid direction changes
- **Mobile Touch Controls** - Swipe gestures and virtual D-pad

### 🏅 **Achievement System**
- **60+ Unique Achievements** across 6 categories
- **Speed Achievements** - From Speed Demon (2x) to Hyperspeed (6x)
- **Survival Challenges** - Marathon sessions and endurance tests
- **Fun Achievements** - Wall Breaker, Self-Destruct Master, and more!
- **Tiered Rewards** - Common to Legendary achievements with points

### 📊 **Statistics & Leaderboards**
- **Comprehensive Stats Tracking** - Games played, scores, survival time, and more
- **Real-time Leaderboards** - Global rankings across all game modes
- **Personal Progress** - Track your improvement over time
- **Achievement Points** - Earn points for unlocking achievements

### 🎨 **Modern UI/UX**
- **Beautiful Gradients** - Stunning visual design with smooth animations
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Dark Theme** - Easy on the eyes for long gaming sessions
- **Real-time Updates** - Live speed indicators and progress tracking

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snakrx.git
   cd snakrx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and start playing!

## 🎮 How to Play

### **Controls**
- **WASD** or **Arrow Keys** - Move the snake
- **Spacebar** - Pause/Resume
- **R** - Restart game
- **Escape** - Quit to menu

### **Multiplayer Controls**
- **Player 1**: WASD
- **Player 2**: Arrow Keys  
- **Player 3**: IJKL
- **Player 4**: Numpad (8456)

### **Mobile Controls**
- **Swipe** - Change direction
- **Touch buttons** - Virtual D-pad available

## 🛠️ Development

### **Tech Stack**
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Gradients
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel/Netlify ready

### **Project Structure**
```
src/
├── components/           # Reusable UI components
│   ├── game/            # Game-specific components
│   ├── ui/              # General UI components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
│   ├── useGame.js       # Main game logic
│   ├── useGameInput.js  # Input handling
│   └── useAuth.js       # Authentication
├── pages/               # Page components
├── utils/               # Utility functions
├── data/                # Game configurations
└── services/            # External services
```

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🎯 Game Mechanics

### **Speed System**
- Starts at **1.0x speed** (250ms intervals)
- Increases by **0.1x** with each food eaten
- Maximum speed of **6x+** for ultimate challenge
- Visual speed indicator in game UI

### **Scoring System**
- **Classic Mode**: 5 points per food
- **VS AI Easy**: 5 points per food
- **VS AI Medium**: 10 points per food  
- **VS AI Impossible**: 20 points per food
- **Multiplayer**: 10 points per food

### **AI Difficulty Levels**
- **🟢 Easy**: Basic pathfinding, makes occasional mistakes
- **🟡 Medium**: Smart pathfinding with strategic planning
- **🔴 Impossible**: Perfect pathfinding with predictive behavior

## 🏆 Achievement Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **🎮 Gameplay** | Core game achievements | First Win, High Scorer |
| **⚡ Speed** | Speed-based challenges | Speed Demon, Hyperspeed |
| **⏱️ Survival** | Time-based achievements | Marathon, Endurance |
| **🤖 AI** | AI opponent victories | AI Slayer, Impossible |
| **👥 Social** | Multiplayer achievements | Party Winner, Domination |
| **😄 Fun** | Humorous achievements | Wall Breaker, Accident Prone |

## 📱 Mobile Support

SnakrX is fully optimized for mobile devices with:
- **Touch Controls** - Swipe to change direction
- **Virtual D-Pad** - On-screen controls option
- **Responsive Layout** - Adapts to all screen sizes
- **Performance Optimized** - Smooth 60fps gameplay

## 🔧 Configuration

### **Environment Variables**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **Game Configuration**
Customize game settings in `src/utils/gameUtils.js`:
- Board sizes for different modes
- Speed progression rates
- Scoring systems
- AI difficulty parameters

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```

### **Deploy to Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Blessan Corley**
- **Email**: blessancorley@gmail.com
- **Phone**: +91 9976768211
- **GitHub**: [@blessancorley](https://github.com/blessancorley)

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Firebase** - For the backend infrastructure
- **Lucide** - For the beautiful icons
- **Framer Motion** - For smooth animations

## 📞 Support

Having issues? Need help? Contact us:

- **📧 Email**: blessancorley@gmail.com
- **📱 Phone**: +91 9976768211
- **🐛 Bug Reports**: Open an issue on GitHub
- **💡 Feature Requests**: Open an issue with the enhancement label

---

<div align="center">

**🐍 Built with ❤️ by Blessan Corley**

[⭐ Star this repo](https://github.com/blessancorley/snakrx) • [🐛 Report Bug](https://github.com/blessancorley/snakrx/issues) • [✨ Request Feature](https://github.com/blessancorley/snakrx/issues)

</div>