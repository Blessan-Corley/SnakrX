import { Link } from 'react-router-dom';
import { Award, BarChart3, Play, Shield, Trophy, Zap } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';

const HomeQuickActionsSection = ({
  isAdmin,
  lastPlayedSelection,
  onNavigate,
  onPlayLastMode
}) => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <Zap className="mr-2" size={20} />
      Quick Actions
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {lastPlayedSelection && (
        <Button variant="ghost-primary" fullWidth onClick={onPlayLastMode}>
          <Play size={18} className="mr-2" />
          Last Played
        </Button>
      )}
      <Link to="/leaderboard">
        <Button variant="ghost-primary" fullWidth onClick={() => onNavigate('/leaderboard')}>
          <Trophy size={18} className="mr-2" />
          Leaderboard
        </Button>
      </Link>
      <Link to="/profile">
        <Button variant="ghost-primary" fullWidth onClick={() => onNavigate('/profile')}>
          <BarChart3 size={18} className="mr-2" />
          Profile
        </Button>
      </Link>
      <Link to="/achievements">
        <Button variant="ghost-primary" fullWidth onClick={() => onNavigate('/achievements')}>
          <Award size={18} className="mr-2" />
          Achievements
        </Button>
      </Link>
      {isAdmin && (
        <Link to="/admin">
          <Button variant="ghost-primary" fullWidth onClick={() => onNavigate('/admin')}>
            <Shield size={18} className="mr-2" />
            Admin
          </Button>
        </Link>
      )}
    </div>
  </div>
);

export default HomeQuickActionsSection;
