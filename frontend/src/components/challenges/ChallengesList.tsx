import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fetchMyChallenges, respondToChallenge } from "@/services/challengeService";
import { useToast } from "@/hooks/use-toast";

type Challenge = {
  id: number;
  sender: {
    id: number;
    full_name: string;
    username: string;
    profile_picture: string | null;
  };
  receiver: {
    id: number;
    full_name: string;
    username: string;
    profile_picture: string | null;
  };
  game: string;
  match_date: string;
  match_time: string;
  status: "pending" | "accepted" | "declined" | "completed";
  is_incoming: boolean;
};

const ChallengesList = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const { toast } = useToast();

  const loadChallenges = async () => {
    try {
      const data = await fetchMyChallenges();
      setChallenges(data);
    } catch (error) {
      toast({ title: "Error loading challenges" });
    }
  };

  const handleResponse = async (id: number, response: "accept" | "decline") => {
    try {
      await respondToChallenge(id, response);
      toast({ title: `Challenge ${response}ed` });
      loadChallenges();
    } catch {
      toast({ title: `Failed to ${response} challenge` });
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  if (challenges.length === 0) {
    return <p className="text-sm text-muted-foreground">No challenges yet.</p>;
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <Card key={challenge.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm font-medium">
                  {challenge.is_incoming
                    ? `${challenge.sender.full_name} challenged you`
                    : `You challenged ${challenge.receiver.full_name}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Game: {challenge.game} •{" "}
                  {format(
                    new Date(`${challenge.match_date}T${challenge.match_time}`),
                    "PPpp"
                  )}
                </p>
              </div>
              <div>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    challenge.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : challenge.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : challenge.status === "declined"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {challenge.status}
                </span>
              </div>
            </div>

            {challenge.is_incoming && challenge.status === "pending" && (
              <div className="flex gap-2 mt-2">
                <Button
                  className="bg-scoresync-blue hover:bg-scoresync-blue/90"
                  size="sm"
                  onClick={() => handleResponse(challenge.id, "accept")}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResponse(challenge.id, "decline")}
                >
                  Decline
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChallengesList;
