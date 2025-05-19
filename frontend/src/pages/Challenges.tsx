// All imports unchanged
import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SafeAvatar from "@/components/ui/SafeAvatar";
import { useAuth } from "@/hooks/use-auth";
import {
  createChallenge,
  respondToChallenge,
  fetchMyChallenges,
} from "@/services/challengeService";
import axios from "@/services/axiosInstance";

const ChallengesPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [tab, setTab] = useState<"pending" | "completed">("pending");
  const [games, setGames] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedFriend, setSelectedFriend] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    fetchChallenges();
    fetchGamesAndFriends();
  }, []);

  const fetchChallenges = async () => {
    try {
      const data = await fetchMyChallenges();
      setChallenges(data || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const fetchGamesAndFriends = async () => {
    try {
      const [gameRes, friendRes] = await Promise.all([
        axios.get("/games/"),
        axios.get("/friends/list/"),
      ]);

      const friendsWithGames = await Promise.all(
        (friendRes.data || []).map(async (f: any) => {
          try {
            const res = await axios.get(`/users/${f.id}/`);
            return { ...f, games: res.data.games || [] };
          } catch {
            return f;
          }
        })
      );

      setGames(gameRes.data || []);
      setFriends(friendsWithGames || []);
    } catch (err) {
      console.error("Failed to load games or friends", err);
    }
  };

  const handleGameChange = (value: string) => {
    setSelectedGame(value);
    setSelectedFriend("");
  };

  const handleSubmitChallenge = async () => {
    try {
      const res = await createChallenge({
        receiver_id: Number(selectedFriend),
        game_id: Number(selectedGame),
        scheduled_time: scheduledTime,
      });

      if (res?.id) {
        setSelectedGame("");
        setSelectedFriend("");
        setScheduledTime("");
        fetchChallenges();
        alert("Challenge sent!");
      } else {
        alert("Challenge might have been sent, but response was unexpected.");
      }
    } catch (err: any) {
      if (err?.response?.status === 201 && err?.response?.data) {
        fetchChallenges();
        alert("Challenge sent!");
      } else {
        console.error("Challenge creation failed:", err);
        alert("Failed to send challenge.");
      }
    }
  };

  const handleAccept = async (id: number) => {
    await respondToChallenge(id, "accept");
    fetchChallenges();
  };

  const handleDecline = async (id: number) => {
    await respondToChallenge(id, "decline");
    fetchChallenges();
  };

  // Defensive: Only filter when currentUser is set
  const userId = currentUser?.id || currentUser?.user_id;

  const pending = challenges.filter(
    (ch) =>
      ch.status === "pending" &&
      ([ch.sender?.id, ch.receiver?.id, ch.sender?.user_id, ch.receiver?.user_id].includes(userId))
  );

  const completed = challenges.filter(
    (ch) =>
      ch.status === "completed" &&
      ([ch.sender?.id, ch.receiver?.id, ch.sender?.user_id, ch.receiver?.user_id].includes(userId))
  );

//   useEffect(() => {
//   if (completed.length > 0) {
//     console.log("🧩 Completed challenge match data:");
//     completed.forEach((ch) =>
//       console.log("Match object:", JSON.stringify(ch.match, null, 2))
//     );
//   }
// }, [completed]);


  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <CalendarIcon className="mr-2 text-scoresync-blue" />
          Your Challenges
        </h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} /> Challenge a Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Challenge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Game</Label>
                <Select onValueChange={handleGameChange} value={selectedGame}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Select Friend</Label>
                <Select
                  onValueChange={setSelectedFriend}
                  value={selectedFriend}
                  disabled={!selectedGame}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a friend" />
                  </SelectTrigger>
                  <SelectContent>
                    {friends
                      .filter(
                        (f) =>
                          selectedGame &&
                          Array.isArray(f.games) &&
                          f.games.some((g: any) => String(g.id) === selectedGame)
                      )
                      .map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.full_name || f.username || `User #${f.id}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Scheduled Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSubmitChallenge}
                disabled={!selectedGame || !selectedFriend || !scheduledTime}
              >
                Send Challenge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CalendarIcon className="mr-2 text-scoresync-blue" size={20} />
            Your Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tab && (
            <Tabs
              value={tab}
              onValueChange={(value: string) => setTab(value as "pending" | "completed")}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="space-y-4">
                  {pending.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending challenges</p>
                  ) : (
                    pending.map((ch) => (
                      <Card key={ch.id} className="border p-4">
                        <div className="flex justify-between items-center flex-wrap gap-3">
                          <div className="flex gap-3 items-center">
                            <SafeAvatar
                              src={ch.sender?.profile_picture}
                              fallback={ch.sender?.full_name?.[0] || "U"}
                              size="sm"
                            />
                            <SafeAvatar
                              src={ch.receiver?.profile_picture}
                              fallback={ch.receiver?.full_name?.[0] || "U"}
                              size="sm"
                            />
                            <div>
                              <p className="font-semibold">
                                {ch.sender?.full_name} vs {ch.receiver?.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Game: {ch.game_name || "Unknown"} • {format(new Date(ch.scheduled_time), "PPpp")}
                              </p>
                            </div>
                          </div>

                          {ch.role === "receiver" && ch.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAccept(ch.id)}>Accept</Button>
                              <Button size="sm" variant="outline" onClick={() => handleDecline(ch.id)}>Decline</Button>
                            </div>
                          ) : (
                            <p
                              className={`px-3 py-1 rounded-full text-sm ${
                                ch.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ch.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ch.status.charAt(0).toUpperCase() + ch.status.slice(1)}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed">
                    <div className="space-y-4">
                      {completed.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No completed challenges</p>
                      ) : (
                        completed.map((ch) => (
                          <Card
                            key={ch.id}
                            className="border p-4 cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => {
                              if (ch.match && ch.match.id) {
                                navigate(`/challenges/match/${ch.match.id}`);
                              }
                            }}
                          >
                            <div className="flex justify-between items-center flex-wrap gap-3">
                              <div className="flex gap-3 items-center">
                                <SafeAvatar
                                  src={ch.sender?.profile_picture}
                                  fallback={ch.sender?.full_name?.[0] || "U"}
                                  size="sm"
                                />
                                <SafeAvatar
                                  src={ch.receiver?.profile_picture}
                                  fallback={ch.receiver?.full_name?.[0] || "U"}
                                  size="sm"
                                />
                                <div>
                                  <p className="font-semibold">
                                    {ch.sender?.full_name} vs {ch.receiver?.full_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Game: {ch.game_name || "Unknown"} •{" "}
                                    {format(new Date(ch.scheduled_time), "PPpp")}
                                  </p>
                                  {ch.match && typeof ch.match === "object" && (
                                    <>
                                      <p className="text-sm">
                                        Score: {ch.match.player1_score ?? "N/A"} -{" "}
                                        {ch.match.player2_score ?? "N/A"}
                                      </p>
                                      <p className="text-sm text-green-700 font-semibold">
                                        Winner:{" "}
                                        {typeof ch.match.winner_username === "string"
                                          ? ch.match.winner_username
                                          : JSON.stringify(ch.match.winner_username)}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                              <p className="text-green-600 font-semibold">Completed</p>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
              </TabsContent>


            </Tabs>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ChallengesPage;
