import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "@/services/axiosInstance";
import { useNavigate } from 'react-router-dom';

const LiveMatchPageGuest = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [player1Stats, setPlayer1Stats] = useState({ aces: 0, doubleFaults: 0, breakPoints: 0 });
  const [player2Stats, setPlayer2Stats] = useState({ aces: 0, doubleFaults: 0, breakPoints: 0 });

  const fetchMatch = async () => {
    try {
      const res = await axios.post(`/matches/${matchId}/join/`);
      setMatch((prev: any) => ({
        ...res.data,
        winner_name: res.data.winner_name || prev?.winner_name || null,
      }));
    } catch (err) {
      console.error("Failed to load match", err);
      setError("Could not load match");
    } finally {
      setLoading(false);
    }
  };

  const sendPoint = async (winner: "player1" | "player2") => {
    try {
      const res = await axios.post(`/matches/${matchId}/point/`, { winner });
      setMatch((prev: any) => ({
        ...res.data,
        winner_name: res.data.winner_name || prev?.winner_name || null,
      }));
    } catch (err) {
      console.error("Failed to send point", err);
    }
  };

  const handleEndMatch = async () => {
    if (!window.confirm("End the match?")) return;

    const sets = match.sets || [];
    const totalPlayer1Games = sets.reduce((sum: number, s: any) => sum + s.player1_games, 0);
    const totalPlayer2Games = sets.reduce((sum: number, s: any) => sum + s.player2_games, 0);

    const winnerName =
      totalPlayer1Games > totalPlayer2Games
        ? match.player1_name
        : totalPlayer2Games > totalPlayer1Games
        ? match.player2_name
        : match.player1_name;

    const extra_stats = {
      player1: player1Stats,
      player2: player2Stats,
    };

    try {
      const res = await axios.post(`/matches/${matchId}/end/`, {
        player1_score: totalPlayer1Games,
        player2_score: totalPlayer2Games,
        winner_name: winnerName,
        extra_stats,
      });
      setMatch(res.data);
    } catch (err) {
      console.error("Failed to end match", err);
      alert("Could not end match");
    }
  };

  useEffect(() => {
  let intervalId: NodeJS.Timeout | null = null;

  const fetchAndSet = async () => {
    try {
      const res = await axios.post(`/matches/${matchId}/join/`);
      const isCompleted = res.data.status === "completed";

      setMatch((prev: any) => {
        if (prev?.status === "completed") return prev;
        return {
          ...res.data,
          winner_name: res.data.winner_name ?? prev?.winner_name ?? null,
        };
      });

      if (
        isCompleted &&
        (!res.data.extra_stats || Object.keys(res.data.extra_stats).length === 0)
      ) {
        const player1_score = res.data.sets.reduce((sum: number, s: any) => sum + s.player1_games, 0);
        const player2_score = res.data.sets.reduce((sum: number, s: any) => sum + s.player2_games, 0);

        await axios.post(`/matches/${matchId}/end/`, {
          player1_score,
          player2_score,
          winner_name: res.data.winner_name,
          extra_stats: {
            player1: player1Stats,
            player2: player2Stats,
          },
        });

        // ✅ Explicitly refresh guest match history after completion
        await axios.get("/matches/guest-match/history/");
      }

      if (isCompleted && intervalId) {
        clearInterval(intervalId);
        intervalId = null;

        // ✅ Ensure immediate guest match history refresh clearly
        await axios.get("/matches/guest-match/history/");
        navigate('/new-match', { state: { refreshHistory: true } });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching match:", error);
      setError("Could not load match");
      setLoading(false);
    }
  };

  fetchAndSet();
  intervalId = setInterval(fetchAndSet, 3000);

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [matchId, player1Stats, player2Stats]);




  if (loading) return <Layout><p>Loading match...</p></Layout>;
  if (error) return <Layout><p>{error}</p></Layout>;

  const sets = match.sets || [];
  const tennisPoints = ["0", "15", "30", "40", "Adv"];

  const getPoint = (p1: number, p2: number, side: "player1" | "player2") => {
    if (p1 >= 3 && p2 >= 3) {
      if (p1 === p2) return "40";
      if (side === "player1") return p1 > p2 ? "Adv" : "";
      if (side === "player2") return p2 > p1 ? "Adv" : "";
    }
    const val = side === "player1" ? p1 : p2;
    return tennisPoints[val] ?? "0";
  };

  const renderTeamName = (players: any[], start: number) => {
    return players.slice(start, start + 2).map(p => p.full_name).join(" & ");
  };

  const isDoubles = match.match_type === "doubles";
  const player1Display = isDoubles ? renderTeamName(match.guest_players, 0) : match.player1_name;
  const player2Display = isDoubles ? renderTeamName(match.guest_players, 2) : match.player2_name;

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
          <CardTitle>{player1Display} vs {player2Display}</CardTitle>
          <p>{match.game_type?.toUpperCase()}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between gap-10">
            <div>
              <p className="font-bold">{player1Display}</p>
              <p>Point: {getPoint(match.player1_points, match.player2_points, "player1")}</p>
              {match.status === "in_progress" && !match.winner_name && (
                <>
                  <Button onClick={() => sendPoint("player1")}>Win Point</Button>
                  <div className="mt-4">
                    {renderStatsInputs("Aces", player1Stats.aces, (v) => setPlayer1Stats({ ...player1Stats, aces: v }))}
                    {renderStatsInputs("Double Faults", player1Stats.doubleFaults, (v) => setPlayer1Stats({ ...player1Stats, doubleFaults: v }))}
                    {renderStatsInputs("Break Points", player1Stats.breakPoints, (v) => setPlayer1Stats({ ...player1Stats, breakPoints: v }))}
                  </div>
                </>
              )}
            </div>

            <div className="text-right">
              <p className="font-bold">{player2Display}</p>
              <p>Point: {getPoint(match.player1_points, match.player2_points, "player2")}</p>
              {match.status === "in_progress" && !match.winner_name && (
                <>
                  <Button onClick={() => sendPoint("player2")}>Win Point</Button>
                  <div className="mt-4">
                    {renderStatsInputs("Aces", player2Stats.aces, (v) => setPlayer2Stats({ ...player2Stats, aces: v }))}
                    {renderStatsInputs("Double Faults", player2Stats.doubleFaults, (v) => setPlayer2Stats({ ...player2Stats, doubleFaults: v }))}
                    {renderStatsInputs("Break Points", player2Stats.breakPoints, (v) => setPlayer2Stats({ ...player2Stats, breakPoints: v }))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mt-4">Sets:</h3>
            {sets.length ? (
              sets.map((s: any, i: number) => (
                <p key={i}>Set {i + 1}: {s.player1_games} - {s.player2_games}</p>
              ))
            ) : (
              <p>No sets yet.</p>
            )}
          </div>

          {match.status === "completed" && match.winner_name && (
            <p className="text-green-600 font-semibold mt-2">
              Winner: {match.winner_name}
            </p>
          )}

          {match.status === "in_progress" && !match.winner_name && (
            <div className="text-center mt-4">
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

export default LiveMatchPageGuest;
