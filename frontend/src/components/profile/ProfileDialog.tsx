import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserPlus, UserMinus, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileData {
  id: string;
  name: string;
  username: string;
  avatar: string;
  stats: {
    rank: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
  };
  relationship: 'none' | 'friend' | 'blocked';
}

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData | null;
  onSendMessage?: (userId: string) => void;
  onToggleFriend?: (userId: string, action: 'add' | 'remove') => void;
  onToggleBlock?: (userId: string, action: 'block' | 'unblock') => void;
  isCurrentUser?: boolean;
}

const ProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onSendMessage,
  onToggleFriend,
  onToggleBlock,
  isCurrentUser = false
}: ProfileDialogProps) => {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>

          <Card className="w-full">
            <CardContent className="grid grid-cols-4 gap-4 p-4">
              <div className="text-center">
                <p className="font-bold text-lg">{profile.stats.rank}</p>
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile.stats.gamesPlayed}</p>
                <p className="text-xs text-muted-foreground">Games</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile.stats.wins}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile.stats.losses}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
            </CardContent>
          </Card>

          {!isCurrentUser && (
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => onSendMessage?.(profile.id)}>
                <MessageSquare size={16} className="mr-2" />
                Message
              </Button>
              {profile.relationship === 'friend' ? (
                <Button variant="outline" className="flex-1" onClick={() => onToggleFriend?.(profile.id, 'remove')}>
                  <UserMinus size={16} className="mr-2" />
                  Unfriend
                </Button>
              ) : profile.relationship === 'none' ? (
                <Button className="flex-1 bg-scoresync-blue hover:bg-scoresync-blue/90" onClick={() => onToggleFriend?.(profile.id, 'add')}>
                  <UserPlus size={16} className="mr-2" />
                  Add Friend
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onToggleBlock?.(profile.id, profile.relationship === 'blocked' ? 'unblock' : 'block')}
              >
                <Ban size={16} className="mr-2" />
                {profile.relationship === 'blocked' ? 'Unblock' : 'Block'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
