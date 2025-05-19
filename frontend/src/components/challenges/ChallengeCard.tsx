import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Flag } from 'lucide-react';

interface ChallengeCardProps {
  challenger: {
    name: string;
    avatar: string;
  };
  game: string;
  scheduledDate: string;
  status: 'pending' | 'accepted' | 'declined';
  isReceiver: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const ChallengeCard = ({ 
  challenger, 
  game, 
  scheduledDate, 
  status,
  onAccept,
  onDecline ,
  isReceiver
}: ChallengeCardProps) => {
  return (
    <Card className="mb-4 animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={challenger.avatar} />
            <AvatarFallback>{challenger.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium">{challenger.name}</h3>
            <p className="text-sm text-muted-foreground">
              challenged you to a game of <span className="font-medium">{game}</span>
            </p>
            <p className="text-sm flex items-center mt-1">
              <Calendar size={14} className="mr-1 text-scoresync-blue" />
              {scheduledDate}
            </p>
          </div>
        </div>
      </CardContent>
      
      {status === 'pending' && isReceiver && (
        <CardFooter className="flex justify-between pt-2 border-t">
          <Button 
            variant="outline" 
            className="w-[48%]"
            onClick={onDecline}
          >
            <Flag size={16} className="mr-1 text-red-500" /> Decline
          </Button>
          <Button 
            className="w-[48%] bg-scoresync-blue hover:bg-scoresync-blue/90"
            onClick={onAccept}
          >
            <Flag size={16} className="mr-1 text-green-500" /> Accept
          </Button>
        </CardFooter>
      )}
      
      {status === 'accepted' && (
        <CardFooter className="flex justify-between pt-2 border-t">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ChallengeCard;
