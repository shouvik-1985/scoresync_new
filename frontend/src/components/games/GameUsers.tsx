import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Flag } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { fetchGameFriends } from "@/services/friendService";
import { useAuth } from '@/hooks/use-auth';

interface GameUser {
  id: number;
  full_name: string;
  username: string;
  avatar_url?: string;
}

interface GameUsersProps {
  gameId: number;
  onOpenChat: (userId: string) => void;
  onSendChallenge: (userId: string) => void;
}

const GameUsers = ({ gameId, onOpenChat, onSendChallenge }: GameUsersProps) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<GameUser[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const friends = await fetchGameFriends(gameId);
        setUsers(friends);
      } catch (err) {
        console.error('Failed to load friends for game:', err);
        toast({
          title: "Error",
          description: "Could not load players.",
          variant: "destructive",
        });
      }
    };

    loadUsers();
  }, [gameId]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      {users.length === 0 && (
        <p className="text-muted-foreground">No friends found for this game.</p>
      )}
      {users.map((user) => (
        <Card key={user.id} className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback>{user.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.id !== currentUser?.id && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onOpenChat(String(user.id))}
                    >
                      <MessageSquare size={16} className="mr-1" /> Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSendChallenge(String(user.id))}
                    >
                      <Flag size={16} className="mr-1" /> Challenge
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GameUsers;
