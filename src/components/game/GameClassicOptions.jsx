import Card from '@/components/ui/Card';
import { CLASSIC_MODE_OPTIONS } from './gamePageConfig';

const GameClassicOptions = ({ bonusFoodToggle, onShowAllModes, onSelectMode }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Classic Mode Options</h2>
        <p className="text-white/70">Choose how you want to play classic snake.</p>
      </div>
      <button
        type="button"
        onClick={onShowAllModes}
        className="self-start md:self-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-transparent text-white border border-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/40 hover:shadow-card"
      >
        View All Modes
      </button>
    </div>
    {bonusFoodToggle}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {CLASSIC_MODE_OPTIONS.map(({ id, title, description, Icon, features }) => (
        <Card
          key={id}
          variant="glass"
          clickable
          onClick={() => onSelectMode(id)}
          className="h-full transition-all duration-300 hover:shadow-glow cursor-pointer"
        >
          <div className="text-center p-6">
            <div className="flex items-center justify-center text-white mb-4">
              <Icon size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-white/70 mb-4 leading-relaxed">{description}</p>
            <div className="space-y-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center justify-center text-white/60 text-sm">
                  <div className="w-1 h-1 bg-primary-500 rounded-full mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default GameClassicOptions;
