import { CheckCircle, Cookie, Database, Eye, Lock, Shield } from 'lucide-react';

const iconMap = {
  checkCircle: CheckCircle,
  cookie: Cookie,
  database: Database,
  eye: Eye,
  lock: Lock,
  shield: Shield
};

export const getPrivacySectionIcon = (iconKey) => iconMap[iconKey] ?? Shield;
