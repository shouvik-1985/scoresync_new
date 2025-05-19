
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useSubmitScore } from '@/hooks/use-submit-score';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TENNIS_POINTS = ['0', '15', '30', '40', 'Ad'];

const TennisScoreForm = () => {
  const { toast } = useToast();
  const { submitScore, isSubmitting } = useSubmitScore();
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1Sets, setPlayer1Sets] = useState<string[]>(['0']);
  const [player2Sets, setPlayer2Sets] = useState<string[]>(['0']);

  const validateTennisScore = (p1Sets: string[], p2Sets: string[]) => {
    // Basic tennis rules validation
    const p1SetsWon = p1Sets.filter(set => parseInt(set) >= 6).length;
    const p2SetsWon = p2Sets.filter(set => parseInt(set) >= 6).length;
    
    if (p1SetsWon > 3 || p2SetsWon > 3) {
      return "Invalid number of sets won";
    }

    for (let i = 0; i < p1Sets.length; i++) {
      const p1Score = parseInt(p1Sets[i]);
      const p2Score = parseInt(p2Sets[i]);
      
      if (p1Score > 7 || p2Score > 7) {
        return "Invalid set score";
      }

      if (p1Score === 6 && p2Score === 6) {
        if (i !== p1Sets.length - 1) {
          return "Tiebreak can only occur in the final set";
        }
      }

      if ((p1Score === 6 && p2Score < 5) || (p2Score === 6 && p1Score < 5)) {
        continue;
      }

      if (p1Score === 7 && (p2Score === 5 || p2Score === 6)) {
        continue;
      }

      if (p2Score === 7 && (p1Score === 5 || p1Score === 6)) {
        continue;
      }

      if (Math.abs(p1Score - p2Score) < 2 && Math.max(p1Score, p2Score) >= 6) {
        return "Invalid set score - must win by 2 games";
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateTennisScore(player1Sets, player2Sets);
    if (error) {
      toast({
        title: "Invalid Score",
        description: error,
        variant: "destructive",
      });
      return;
    }

    const p1Score = player1Sets.reduce((sum, set) => sum + parseInt(set), 0);
    const p2Score = player2Sets.reduce((sum, set) => sum + parseInt(set), 0);

    submitScore({
      game: 'Tennis Match',
      date: new Date().toISOString(),
      players: [
        {
          id: '1',
          name: player1Name,
          score: p1Score,
        },
        {
          id: '2',
          name: player2Name,
          score: p2Score,
        },
      ],
    });
  };

  const handleAddSet = () => {
    if (player1Sets.length < 5) {
      setPlayer1Sets([...player1Sets, '0']);
      setPlayer2Sets([...player2Sets, '0']);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="player1Name">Player 1 Name</Label>
          <Input
            id="player1Name"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            placeholder="Enter player 1 name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="player2Name">Player 2 Name</Label>
          <Input
            id="player2Name"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            placeholder="Enter player 2 name"
            required
          />
        </div>
      </div>

      <div>
        <Label>Set Scores</Label>
        <div className="mt-2 space-y-4">
          {player1Sets.map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  min="0"
                  max="7"
                  value={player1Sets[index]}
                  onChange={(e) => {
                    const newSets = [...player1Sets];
                    newSets[index] = e.target.value;
                    setPlayer1Sets(newSets);
                  }}
                  placeholder="Player 1 Set Score"
                  required
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  max="7"
                  value={player2Sets[index]}
                  onChange={(e) => {
                    const newSets = [...player2Sets];
                    newSets[index] = e.target.value;
                    setPlayer2Sets(newSets);
                  }}
                  placeholder="Player 2 Set Score"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddSet}
          disabled={player1Sets.length >= 5}
        >
          Add Set
        </Button>
        <Button 
          type="submit"
          className="bg-scoresync-blue hover:bg-scoresync-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Score'}
        </Button>
      </div>
    </form>
  );
};

export default TennisScoreForm;
