
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Goal } from "lucide-react";

const games = [
  {
    id: 'tennis',
    name: 'Tennis',
    icon: Goal,
    description: 'Track tennis matches with proper scoring rules',
  },
  // More games can be added here later
];

interface GameSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameSelect: (gameId: string) => void;
}

const GameSelectDialog = ({ open, onOpenChange, onGameSelect }: GameSelectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a Game</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Button
                key={game.id}
                variant="outline"
                className="w-full justify-start gap-2 h-auto p-4"
                onClick={() => {
                  onGameSelect(game.id);
                  onOpenChange(false);
                }}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{game.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {game.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameSelectDialog;
