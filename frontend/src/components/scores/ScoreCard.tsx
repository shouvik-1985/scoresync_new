
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';

interface ScoreCardProps {
  game: string;
  date: string;
  players: {
    id: string;
    name: string;
    avatar: string;
    score: number;
    winner: boolean;
  }[];
}

const ScoreCard = ({ game, date, players }: ScoreCardProps) => {
  return (
    <Card className="score-card mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{game}</CardTitle>
            <div className="flex items-center text-muted-foreground text-xs mt-1">
              <CalendarIcon size={14} className="mr-1" />
              {date}
            </div>
          </div>
          <Badge variant="outline" className="ml-2 bg-scoresync-lightGray">
            Completed
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          {players.map((player, index) => (
            <React.Fragment key={player.id}>
              <div className={`flex flex-col items-center ${index > 0 ? 'text-right' : 'text-left'}`}>
                <Avatar className={`h-16 w-16 mb-2 ${player.winner ? 'avatar-ring' : ''}`}>
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-medium text-sm">{player.name}</p>
                <p className={`score-value ${player.winner ? 'text-scoresync-blue' : ''}`}>
                  {player.score}
                </p>
                {player.winner && (
                  <Badge className="mt-1 bg-scoresync-blue">Winner</Badge>
                )}
              </div>
              
              {index < players.length - 1 && (
                <div className="text-xl font-bold text-scoresync-darkGray">vs</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-scoresync-lightGray">Tennis</Badge>
          <Badge variant="outline" className="bg-scoresync-lightGray">Singles</Badge>
        </div>
        <button className="text-scoresync-blue text-sm hover:underline">
          View Details
        </button>
      </CardFooter>
    </Card>
  );
};

export default ScoreCard;
