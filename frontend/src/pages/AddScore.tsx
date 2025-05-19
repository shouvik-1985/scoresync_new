
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GameSelectDialog from '@/components/scores/GameSelectDialog';
import TennisScoreForm from '@/components/scores/TennisScoreForm';

const AddScore = () => {
  const [showGameSelect, setShowGameSelect] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    setShowGameSelect(false);
  };

  const renderScoreForm = () => {
    switch (selectedGame) {
      case 'tennis':
        return <TennisScoreForm />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Score</h1>
        <p className="text-muted-foreground">
          Record the results of your game
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {selectedGame ? 'Enter Score Details' : 'Select a Game'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderScoreForm()}
        </CardContent>
      </Card>

      <GameSelectDialog
        open={showGameSelect}
        onOpenChange={setShowGameSelect}
        onGameSelect={handleGameSelect}
      />
    </Layout>
  );
};

export default AddScore;
