import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "@/services/axiosInstance";

const GuestMatchDetails = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(`/matches/guest-match/${matchId}/`);
        setMatch(res.data);
      } catch (err) {
        console.error("Failed to fetch match", err);
        setError("Unable to load match details.");
      }
    };
    fetchMatch();
  }, [matchId]);

  if (error) return <Layout><p>{error}</p></Layout>;
  if (!match) return <Layout><p>Loading match details...</p></Layout>;

  const renderTeamName = (players: any[], start: number) =>
    players?.slice(start, start + 2).map(p => p.full_name).join(" & ");

  const isDoubles = match.match_type === "doubles";
  const player1Name = isDoubles ? renderTeamName(match.guest_players, 0) : match.player1_name;
  const player2Name = isDoubles ? renderTeamName(match.guest_players, 2) : match.player2_name;

  const stats = match.extra_stats || {};

  const p1Stats = stats.player1 || {};
  const p2Stats = stats.player2 || {};

  return (
    <Layout>
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>{player1Name} vs {player2Name}</CardTitle>
          <p className="text-muted-foreground">{match.game_type?.toUpperCase()} • {match.match_type}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Status:</strong> {match.status}</p>
          <p><strong>Winner:</strong> {match.winner_name}</p>
          <p><strong>Score:</strong> {match.score}</p>
          <p><strong>Played At:</strong> {new Date(match.played_at).toLocaleString()}</p>

          <h3 className="font-semibold mt-4">Sets</h3>
          {match.sets?.length ? (
            match.sets.map((s: any, idx: number) => (
              <p key={idx}>Set {idx + 1}: {s.player1_games} - {s.player2_games}</p>
            ))
          ) : <p>No set data.</p>}

          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <h4 className="text-lg font-bold">{player1Name} Stats</h4>
              <ul className="list-disc ml-5 space-y-1">
                <li>Aces: {p1Stats.aces ?? "N/A"}</li>
                <li>Double Faults: {p1Stats.doubleFaults ?? "N/A"}</li>
                <li>Break Points: {p1Stats.breakPoints ?? "N/A"}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold">{player2Name} Stats</h4>
              <ul className="list-disc ml-5 space-y-1">
                <li>Aces: {p2Stats.aces ?? "N/A"}</li>
                <li>Double Faults: {p2Stats.doubleFaults ?? "N/A"}</li>
                <li>Break Points: {p2Stats.breakPoints ?? "N/A"}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default GuestMatchDetails;
