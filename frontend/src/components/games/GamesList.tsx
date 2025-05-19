import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import GameUsers from './GameUsers';
import { useToast } from "@/hooks/use-toast";
import axios from '@/services/axiosInstance';
import { createChallenge } from '@/services/challengeService';
import { useAuth } from '@/hooks/use-auth';

type Game = {
  id: string;
  name: string;
  icon: string;
  players: number;
  matches: number;
};

const GamesList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('/games/');
        setGames(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGames();
  }, []);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleOpenChat = (userId: string) => {
    toast({
      title: "Opening chat",
      description: "Starting conversation with user",
    });
  };

  const handleSendChallenge = async (userId: string) => {
    if (!selectedGame || !currentUser) return;

    try {
      await createChallenge({
        receiver_id: Number(userId),
        game_id: Number(selectedGame.id),
        scheduled_time: new Date().toISOString(),
      });

      toast({
        title: "Challenge sent",
        description: "Waiting for player to accept",
      });
    } catch (err) {
      toast({
        title: "Failed to send challenge",
        description: "Please try again.",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  if (selectedGame) {
    return (
      <div>
        <button 
          onClick={() => setSelectedGame(null)}
          className="text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back to games
        </button>
        <GameUsers 
          gameId={Number(selectedGame.id)}
          onOpenChat={handleOpenChat}
          onSendChallenge={handleSendChallenge}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {games.map((game) => (
        <Card 
          key={game.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleGameSelect(game)}
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="text-4xl mb-2">{game.icon}</div>
            <h3 className="font-medium text-base mb-1">{game.name}</h3>
            <p className="text-xs text-muted-foreground">
              {game.players.toLocaleString()} players • {game.matches.toLocaleString()} matches
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GamesList;
