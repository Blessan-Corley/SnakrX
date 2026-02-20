import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const PublicProfileNotFound = ({ onBack }) => (
  <div className="min-h-screen flex items-center justify-center">
    <Card variant="glass" padding="lg">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Profile not found</h2>
        <Button variant="ghost" onClick={onBack} icon={<ArrowLeft size={16} />}>
          Go Back
        </Button>
      </div>
    </Card>
  </div>
);

export default PublicProfileNotFound;
