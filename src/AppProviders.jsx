import { AuthProvider } from './hooks/useAuth.js';
import { FriendsProvider } from './hooks/useFriends.js';
import { AchievementProvider } from './hooks/useAchievements.js';
import { GameProvider } from './hooks/useGame.js';

const AppProviders = ({ children }) => (
  <AuthProvider>
    <FriendsProvider>
      <AchievementProvider>
        <GameProvider>
          {children}
        </GameProvider>
      </AchievementProvider>
    </FriendsProvider>
  </AuthProvider>
);

export default AppProviders;
