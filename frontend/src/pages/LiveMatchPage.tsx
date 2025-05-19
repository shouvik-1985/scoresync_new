import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "@/services/axiosInstance";
import { useAuth } from "@/hooks/use-auth";

const LiveMatchPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [player1Stats, setPlayer1Stats] = useState({ aces: 0, doubleFaults: 0, breakPoints: 0 });
  const [player2Stats, setPlayer2Stats] = useState({ aces: 0, doubleFaults: 0, breakPoints: 0 });

  const fetchMatch = async () => {
    try {
      const res = await axios.post(`/games/matches/${id}/join/`);
      setMatch(res.data);
    } catch (err) {
      console.error("Failed to load match", err);
      setError("Could not load match");
    } finally {
      setLoading(false);
    }
  };

  const sendPoint = async (winner: "player1" | "player2") => {
  try {
    const extra_stats = {
      player1: convertStats(player1Stats),
      player2: convertStats(player2Stats),
    };

    const res = await axios.post(`/games/matches/${id}/point/`, {
      winner,
      extra_stats, // ✅ Send stats in every request, only stored when match ends
    });

    setMatch(res.data);
  } catch (err) {
    console.error("Failed to send point", err);
  }
};


  const convertStats = (stats: any) => ({
  aces: stats.aces || 0,
  double_faults: stats.doubleFaults || 0,
  break_points: stats.breakPoints || 0,
  winners: stats.winners || 0,
  unforced_errors: stats.unforcedErrors || 0,
});


  const handleEndMatch = async () => {
    const confirmed = window.confirm("Are you sure you want to end the match?");
    if (!confirmed) return;

    const sets = match.sets || [];
    const totalPlayer1Games = sets.reduce((sum: number, s: any) => sum + s.player1_games, 0);
    const totalPlayer2Games = sets.reduce((sum: number, s: any) => sum + s.player2_games, 0);

    const winnerId =
      totalPlayer1Games > totalPlayer2Games
        ? match.player1
        : totalPlayer2Games > totalPlayer1Games
        ? match.player2
        : user?.user_id ?? user?.id;

    const extra_stats = {
        player1: convertStats(player1Stats),
        player2: convertStats(player2Stats),
   };


    try {
      const res = await axios.post(`/api/challenges/${match.challenge_id}/tennis-match/`, {
        player1_score: totalPlayer1Games,
        player2_score: totalPlayer2Games,
        winner_id: winnerId,
        extra_stats,
      });
      console.log("✅ Match ended:", res.data);
      fetchMatch();
    } catch (err) {
      console.error("❌ Failed to end match:", err);
      alert("Could not end match.");
    }
  };

  useEffect(() => {
    fetchMatch();
    const interval = setInterval(() => {
      fetchMatch();
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Layout><p>Loading match...</p></Layout>;
  if (error) return <Layout><p>{error}</p></Layout>;

  const sets = match.sets || [];
  const player1Id = match.player1;
  const player2Id = match.player2;
  const currentUserId = user?.user_id ?? user?.id;

  const tennisPoints = ["0", "15", "30", "40", "Adv"];
  const getTennisPoint = (p1: number, p2: number, side: "player1" | "player2") => {
    if (p1 >= 3 && p2 >= 3) {
      if (p1 === p2) return "40";
      if (side === "player1") return p1 > p2 ? "Adv" : "";
      if (side === "player2") return p2 > p1 ? "Adv" : "";
    }
    const value = side === "player1" ? p1 : p2;
    return tennisPoints[value] ?? "0";
  };

  const renderStatsInputs = (
    label: string,
    value: number,
    onChange: (v: number) => void
  ) => (
    <div className="mb-2">
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="border p-1 w-24"
      />
    </div>
  );

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>
            {match.player1_username} vs {match.player2_username}
          </CardTitle>
          <p>{match.game_name}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start gap-10">
            <div>
              <p className="font-bold">{match.player1_username}</p>
              {match.status === "in_progress" && (
                <>
                  <p>Current Point: {getTennisPoint(match.player1_points, match.player2_points, "player1")}</p>
                  {currentUserId === player1Id && (
                    <>
                      <Button onClick={() => sendPoint("player1")}>Win Point</Button>
                      <div className="mt-4">
                        {renderStatsInputs("Aces", player1Stats.aces, (v) => setPlayer1Stats({ ...player1Stats, aces: v }))}
                        {renderStatsInputs("Double Faults", player1Stats.doubleFaults, (v) => setPlayer1Stats({ ...player1Stats, doubleFaults: v }))}
                        {renderStatsInputs("Break Points", player1Stats.breakPoints, (v) => setPlayer1Stats({ ...player1Stats, breakPoints: v }))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="text-right">
              <p className="font-bold">{match.player2_username}</p>
              {match.status === "in_progress" && (
                <>
                  <p>Current Point: {getTennisPoint(match.player1_points, match.player2_points, "player2")}</p>
                  {currentUserId === player2Id && (
                    <>
                      <Button onClick={() => sendPoint("player2")}>Win Point</Button>
                      <div className="mt-4">
                        {renderStatsInputs("Aces", player2Stats.aces, (v) => setPlayer2Stats({ ...player2Stats, aces: v }))}
                        {renderStatsInputs("Double Faults", player2Stats.doubleFaults, (v) => setPlayer2Stats({ ...player2Stats, doubleFaults: v }))}
                        {renderStatsInputs("Break Points", player2Stats.breakPoints, (v) => setPlayer2Stats({ ...player2Stats, breakPoints: v }))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Sets:</h3>
            {sets.length ? (
              sets.map((s: any, i: number) => (
                <p key={i}>Set {i + 1}: {s.player1_games} - {s.player2_games}</p>
              ))
            ) : (
              <p>No sets yet.</p>
            )}
          </div>

          {match.status === "completed" && match.winner_username && (
            <p className="mt-4 text-green-600 font-semibold">
              Winner: {match.winner_username}
            </p>
          )}

          {match.status === "in_progress" && (
            <div className="text-center mt-6">
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleEndMatch}>
                End Match
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default LiveMatchPage;
