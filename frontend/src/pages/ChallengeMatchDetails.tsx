import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "@/services/axiosInstance";

const ChallengeMatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [p1Stats, setP1Stats] = useState<any>({});
  const [p2Stats, setP2Stats] = useState<any>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(`/games/matches/challenge-match/${id}/`);
        setMatch(res.data);

        const stats = res.data.extra_stats || {};
        setP1Stats(stats.player1 || {});
        setP2Stats(stats.player2 || {});
      } catch (err) {
        console.error("Failed to fetch match", err);
        setError("Unable to load match details.");
      }
    };
    fetchMatch();
  }, [id]);

  if (error) return <Layout><p>{error}</p></Layout>;
  if (!match) return <Layout><p>Loading match details...</p></Layout>;

  return (
    <Layout>
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>{match.player1_name}  vs  {match.player2_name}</CardTitle>
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
              <h4 className="text-lg font-bold">{match.player1_name}  Stats</h4>
              <ul className="list-disc ml-5 space-y-1">
                <li>Aces: {p1Stats.aces ?? "N/A"}</li>
                <li>Double Faults: {p1Stats.double_faults ?? "N/A"}</li>
                <li>Break Points: {p1Stats.break_points ?? "N/A"}</li>
                <li>Winners: {p1Stats.winners ?? "N/A"}</li>
                <li>Unforced Errors: {p1Stats.unforced_errors ?? "N/A"}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold">{match.player2_name}  Stats</h4>
              <ul className="list-disc ml-5 space-y-1">
                <li>Aces: {p2Stats.aces ?? "N/A"}</li>
                <li>Double Faults: {p2Stats.double_faults ?? "N/A"}</li>
                <li>Break Points: {p2Stats.break_points ?? "N/A"}</li>
                <li>Winners: {p2Stats.winners ?? "N/A"}</li>
                <li>Unforced Errors: {p2Stats.unforced_errors ?? "N/A"}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ChallengeMatchDetails;
