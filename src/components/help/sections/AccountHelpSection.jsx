import { Gamepad2, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';

const AccountHelpSection = () => (
  <div className="space-y-6">
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6">Account & Settings</h2>

      <div className="space-y-8">
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
                We&apos;ll send a password reset email to your registered address.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Game Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <Zap className="mr-2" size={16} />
                Audio Settings
              </h4>
              <ul className="text-white/70 space-y-1">
                <li> Toggle sound effects on/off</li>
                <li> Adjust volume levels</li>
                <li> Individual sound controls</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <Gamepad2 className="mr-2" size={16} />
                Game Preferences
              </h4>
              <ul className="text-white/70 space-y-1">
                <li> Set favorite game mode</li>
                <li> Display preferences</li>
                <li> Privacy settings</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Data & Privacy</h3>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 mb-3">
              Your game data is securely stored and synced across devices. We collect:
            </p>
            <ul className="text-white/70 space-y-1">
              <li> Game statistics and achievements</li>
              <li> Account information (email, username)</li>
              <li> Game preferences and settings</li>
            </ul>
            <p className="text-white/60 text-sm mt-3">
              See our Privacy Policy for complete details on data handling.
            </p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default AccountHelpSection;
