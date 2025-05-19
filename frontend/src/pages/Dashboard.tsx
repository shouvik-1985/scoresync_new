import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, CalendarIcon } from 'lucide-react';
import GamesList from '@/components/games/GamesList';
import ChallengesList from '@/components/challenges/ChallengesList';
import LeaderboardCard from '@/components/scores/LeaderboardCard';
import ProfileDialog from '@/components/profile/ProfileDialog';
import axios from '@/services/axiosInstance';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

const Dashboard = () => {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any>({});
  const [friends, setFriends] = useState<any[]>([]);
  const [leaderboardFriends, setLeaderboardFriends] = useState<any[]>([]);
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [sidebarStats, setSidebarStats] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [friendsRes, notifRes, historyRes, leaderboardRes, statsRes] = await Promise.all([
          axios.get('/friends/list/'),
          axios.get('/friends/notifications/'),
          axios.get('/games/matches/history/'),
          axios.get('/games/leaderboard/'),
          axios.get('/games/sidebar-stats/'),
        ]);

        const acceptedFriends = friendsRes.data.filter((f: any) => f.status === 'accepted');
        setFriends(acceptedFriends.slice(-4).reverse());
        setNotifications(notifRes.data);
        setRecentScores(historyRes.data || []);
        setLeaderboardFriends(leaderboardRes.data || []);
        setSidebarStats(statsRes.data || null);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [user]);

  const last5 = recentScores.slice(-5);
  const avgScore = last5.length ? last5.reduce((sum, m) => sum + m.player_score, 0) / last5.length : 0;

  const chartData: ChartData<'bar' | 'line', number[], string> = {
    labels: last5.map((m) => `vs ${m.opponent}`),
    datasets: [
      {
        type: 'bar',
        label: 'Your Score',
        data: last5.map((m) => m.player_score),
        backgroundColor: last5.map((m) =>
          user?.full_name && m.winner === user.full_name ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'
        ),
        borderColor: last5.map((m) =>
          user?.full_name && m.winner === user.full_name ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)'
        ),
        borderWidth: 1,
      },
      {
        type: 'line',
        label: 'Avg Score',
        data: Array(last5.length).fill(avgScore),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  };
  const handleSendMessage = (userId: string) => {
  setIsProfileOpen(false);
  navigate('/messages', { state: { userId } });
};


  return (
    <Layout
      sidebarUser={user}
      sidebarFriends={friends}
      notifications={notifications}
      sidebarStats={sidebarStats}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to ScoreSync</h1>
        <p className="text-muted-foreground">Track your scores, challenge friends, and climb the leaderboards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Recent Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {recentScores.length > 0 ? (
                <>
                  <div className="mb-6">
                    <Chart type="bar" data={chartData} options={chartOptions} />
                  </div>
                  <div className="space-y-4">
                    {recentScores.map((m) => (
                      <div key={m.id} className="border p-3 rounded shadow-sm bg-muted/30">
                        <p className="font-semibold">
                          vs {m.opponent} •{' '}
                          <span className="text-xs text-muted-foreground">{format(new Date(m.date), 'PPpp')}</span>
                        </p>
                        <p>
                          Score: <strong>{m.player_score}</strong> - <strong>{m.opponent_score}</strong>
                        </p>
                        <p className="text-sm text-green-700 font-semibold">Winner: {m.winner}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No recent matches played.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Trending Games</CardTitle>
            </CardHeader>
            <CardContent>
              <GamesList friendsOnly={true} messageOnly={true} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="leaderboard">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="leaderboard" className="flex items-center">
                <Trophy size={16} className="mr-1" /> Leaderboard
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center">
                <CalendarIcon size={16} className="mr-1" /> Challenges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard">
              <LeaderboardCard friends={leaderboardFriends} />
            </TabsContent>

            <TabsContent value="challenges">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Your Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChallengesList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        profile={selectedProfile}
        onSendMessage={handleSendMessage}
      />
    </Layout>
  );
};

export default Dashboard;
