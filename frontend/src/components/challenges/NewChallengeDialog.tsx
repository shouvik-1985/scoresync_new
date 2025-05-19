import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { createChallenge } from "@/services/challengeService";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  full_name: string;
  games: string[];
}

interface Game {
  id: number;
  name: string;
}

interface NewChallengeDialogProps {
  friends: User[];
  games: Game[];
  onSuccess: () => void;
}

const NewChallengeDialog: React.FC<NewChallengeDialogProps> = ({
  friends,
  games,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");

  const gamePlayers = selectedGame
    ? friends.filter((f) => f.games.includes(games.find((g) => g.id === selectedGame)?.name || ""))
    : [];

  const handleSubmit = async () => {
    if (!selectedGame || !selectedFriend || !scheduledDate) {
      toast({ title: "Please fill all fields" });
      return;
    }
    try {
      await createChallenge({
        game_id: selectedGame,
        receiver_id: selectedFriend,
        scheduled_time: scheduledDate,
      });
      toast({ title: "Challenge sent!" });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast({ title: "Failed to create challenge" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-scoresync-blue hover:bg-scoresync-blue/90">
          + New Challenge
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Challenge</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select onValueChange={(val) => setSelectedGame(parseInt(val))}>
            <SelectItem value="">Select Game</SelectItem>
            {games.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.name}
              </SelectItem>
            ))}
          </Select>

          <Select onValueChange={(val) => setSelectedFriend(parseInt(val))}>
            <SelectItem value="">Select Friend</SelectItem>
            {gamePlayers.map((f) => (
              <SelectItem key={f.id} value={f.id.toString()}>
                {f.full_name} (@{f.username})
              </SelectItem>
            ))}
          </Select>

          <Input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSubmit}>Send Challenge</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewChallengeDialog;
