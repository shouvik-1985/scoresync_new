import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "@/services/axiosInstance";
import { useLocation } from 'react-router-dom';

const NewMatchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState("tennis");
  const [matchType, setMatchType] = useState("singles");
  const [players, setPlayers] = useState({ p1: "", p2: "", p3: "", p4: "" });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await publicAxios.get("/matches/guest-match/history/");
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
        );
        setHistory(sorted.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch guest match history", err);
      }
    };
    fetchHistory();

    if (location.state?.refreshHistory) {
      fetchHistory();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleChange = (e) => {
    setPlayers({ ...players, [e.target.name]: e.target.value });
  };

  const handleStartMatch = async () => {
    const playerNames =
      matchType === "singles"
        ? [players.p1, players.p2]
        : [players.p1, players.p2, players.p3, players.p4];

    if (playerNames.some((name) => !name.trim())) {
      alert(`Please fill all ${playerNames.length} player names.`);
      return;
    }

    const data = {
      game_type: gameType,
      match_type: matchType,
      players: playerNames,
    };

    try {
      const res = await publicAxios.post("/matches/guest-match/create/", data);
      navigate(`/scores/guest-match/${res.data.match_id}`);
    } catch (err) {
      console.error("Match creation failed", err);
      alert("Failed to create match. Please check player inputs.");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Start a New Match</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Choose Game</h2>
                <select
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="tennis">Tennis</option>
                  <option value="badminton" disabled>Badminton (coming soon)</option>
                  <option value="tt" disabled>Table Tennis (coming soon)</option>
                  <option value="cricket" disabled>Cricket (coming soon)</option>
                  <option value="football" disabled>Football (coming soon)</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Select Match Type</h2>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setMatchType("singles")}
                    variant={matchType === "singles" ? "default" : "outline"}
                  >
                    Singles
                  </Button>
                  <Button
                    onClick={() => setMatchType("doubles")}
                    variant={matchType === "doubles" ? "default" : "outline"}
                  >
                    Doubles
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline">Back</Button>
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Enter Player Names</h2>
                <Input name="p1" placeholder="Player 1 Name" onChange={handleChange} />
                <Input name="p2" placeholder="Player 2 Name" onChange={handleChange} />
                {matchType === "doubles" && (
                  <>
                    <Input name="p3" placeholder="Opponent Player 1" onChange={handleChange} />
                    <Input name="p4" placeholder="Opponent Player 2" onChange={handleChange} />
                  </>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline">Back</Button>
                  <Button onClick={handleStartMatch}>Start Match</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Match History Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Guest Match History</h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No guest matches yet.</p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
              {history.map((match) => (
                <Card
                  key={match.id}
                  onClick={() => navigate(`/scores/guest-match/details/${match.id}`)}
                  className="cursor-pointer hover:shadow-lg transition"
                >
                  <CardHeader>
                    <CardTitle>
                      {match.match_type === "doubles"
                        ? `${match.guest_players?.[0]?.full_name} & ${match.guest_players?.[1]?.full_name} vs ${match.guest_players?.[2]?.full_name} & ${match.guest_players?.[3]?.full_name}`
                        : `${match.player1_name} vs ${match.player2_name}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Game:</strong> {match.game_type}</p>
                    <p><strong>Type:</strong> {match.match_type}</p>
                    <p><strong>Score:</strong> {(match.score && match.score !== "") ? match.score : "N/A"}</p>
                    <p><strong>Status:</strong> {match.status}</p>
                    <p><strong>Winner:</strong> {match.winner_name || "N/A"}</p>
                    <p><strong>Date:</strong> {new Date(match.played_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default NewMatchPage;
