import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import axios from "@/services/axiosInstance";
import { useAuth } from '@/hooks/use-auth';
import SafeAvatar from '@/components/ui/SafeAvatar';

interface User {
  id: number;
  username: string;
  full_name: string;
  profile_picture: string;
}

interface MatchStats {
  user: User;
  games_played: number;
  wins: number;
  losses: number;
  win_ratio: number;
}

interface LeaderboardCardProps {
  onProfileClick: (profile: any) => void;
}

const LeaderboardCard = ({ onProfileClick }: LeaderboardCardProps) => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<MatchStats[]>([]);

 useEffect(() => {
  if (!currentUser?.id) return;

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("/games/leaderboard/");
      setStats(
        res.data.map((entry: any) => ({
          user: {
            id: entry.user_id,
            username: entry.username,
            full_name: entry.full_name,
            profile_picture: entry.profile_picture,
          },
          games_played: entry.games,
          wins: entry.wins,
          losses: entry.games - entry.wins,
          win_ratio: entry.ratio,
        }))
      );
    } catch (err) {
      console.error("❌ Leaderboard fetch failed:", err);
    }
  };

  fetchLeaderboard();
}, [currentUser]);




  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Trophy size={18} className="mr-2 text-scoresync-blue" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stats.length === 0 && (
            <p className="text-sm text-muted-foreground">No leaderboard data found.</p>
          )}
          {stats.map((entry, index) => (
            <div
              key={entry.user.id}
              onClick={() =>
                onProfileClick({
                  id: entry.user.id.toString(),
                  name: entry.user.full_name,
                  username: entry.user.username,
                  avatar: entry.user.profile_picture,
                  stats: {
                    rank: index + 1,
                    gamesPlayed: entry.games_played,
                    wins: entry.wins,
                    losses: entry.losses,
                    ratio: entry.win_ratio,
                  },
                  relationship: "friend",
                })
              }
              className="flex items-center gap-3 p-2 rounded-md hover:bg-scoresync-lightGray cursor-pointer"
            >
              <div className="w-6 text-center font-bold text-sm">{index + 1}</div>
              <SafeAvatar
                src={entry.user.profile_picture}
                fallback={entry.user.full_name?.[0] || "U"}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{entry.user.username}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  {entry.wins}W / {entry.games_played}G
                </p>
                <p className="text-xs text-muted-foreground">
                  {(entry.win_ratio * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
