/**
 * Reusable Card API surface.
 * Internals are split under `ui/card/*` for maintainability.
 */
import Card from './card/CardBase.jsx';

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card/CardStructure.jsx';
export { GameModeCard, AchievementCard, StatsCard, LeaderboardCard } from './card/CardPresets.jsx';

export default Card;
