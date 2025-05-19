import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar } from 'lucide-react';
import { getFriendList, getPendingRequests } from '@/services/friendService';
import { useAuth } from '@/hooks/use-auth';
import axios from '@/services/axiosInstance';
import SafeAvatar from '@/components/ui/SafeAvatar';

interface User {
  id: number;
  username: string;
  full_name: string;
  profile_picture: string;
  games: string[];
  bio: string;
  score?: number;
  wins?: number;
}

interface MatchStats {
  games_played: number;
  wins: number;
  losses: number;
}

const Sidebar = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentFriends, setRecentFriends] = useState<User[]>([]);
  const [matchStats, setMatchStats] = useState<MatchStats>({
    games_played: 0,
    wins: 0,
    losses: 0,
  });
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/profile/');
        setProfile(res.data);
        // Fetch stats after profile loaded
        const statsRes = await axios.get(`/games/matches/users/${res.data.user_id}/stats/`);
        setMatchStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch profile or stats');
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await getPendingRequests();
        setPendingCount(res.data.length);
      } catch (err) {
        console.error('Failed to fetch pending requests');
      }
    };
    fetchPending();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await getFriendList();
        const filtered = res.data.filter((u: User) => u.id !== currentUser?.id);
        const latestFive = filtered.slice(-5).reverse();
        setRecentFriends(latestFive);
      } catch (err) {
        console.error('Failed to fetch friends');
      }
    };
    fetchFriends();
  }, [currentUser?.id]);

  return (
    <div className="w-72 border-r border-scoresync-border bg-white p-4 hidden lg:block">
      <div className="space-y-6">
        {/* User Card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div onClick={() => navigate('/profile')} className="cursor-pointer">
              <SafeAvatar
                src={profile?.profile_picture}
                fallbackText={profile?.full_name || "U"}
                size="lg"
              />
            </div>
            <h3 className="font-bold text-lg mt-4">{profile?.full_name || "My Profile"}</h3>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>

            <div className="flex justify-between w-full mt-4">
              <div className="text-center">
                <p className="font-bold">{matchStats.games_played}</p>
                <p className="text-xs text-muted-foreground">Games</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{matchStats.wins}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{matchStats.losses}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
            </div>

            <Button className="mt-4 w-full bg-scoresync-blue hover:bg-scoresync-blue/90" onClick={() => navigate('/profile/edit')}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="flex flex-col h-auto py-3">
            <Trophy size={18} className="mb-1" />
            <span className="text-xs">{rank ? `Rank ${rank}` : 'Rank --'}</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-3">
            <Users size={18} className="mb-1" />
            <span className="text-xs">{recentFriends.length} Friends</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-3">
            <Calendar size={18} className="mb-1" />
            <span className="text-xs">{pendingCount} Pending</span>
          </Button>
        </div>

        {/* Friend List */}
        <div>
          <h3 className="font-medium mb-3 flex justify-between items-center">
            <span>Friends</span>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/friends')}>
              See All
            </Button>
          </h3>
          <div className="space-y-2">
            {recentFriends.length > 0 ? recentFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-scoresync-lightGray cursor-pointer"
                onClick={() => navigate(`/profile/${friend.id}`)}
              >
                <SafeAvatar src={friend.profile_picture} fallbackText={friend.full_name} size="sm" />
                <div>
                  <p className="text-sm font-bold">{friend.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{friend.username}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground">No friends yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
