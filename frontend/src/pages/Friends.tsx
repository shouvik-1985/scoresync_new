import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import SafeAvatar from '@/components/ui/SafeAvatar';
import { useToast } from '@/hooks/use-toast';
import {
  getFriendList,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUsers
} from '@/services/friendService';
import { useAuth } from '@/hooks/use-auth';

type User = {
  id: number;
  username: string;
  full_name: string;
  profile_picture: string;
  games: string[];
};

type FriendRequest = {
  id: number;
  from_user: User;
  to_user: User;
  status: string;
  created_at: string;
};

const Friends = () => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFriends();
    fetchPending();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await getFriendList();
      const filtered = response.data.filter((f: any) => f.id !== currentUser?.id);
      setFriends(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPending = async () => {
    try {
      const response = await getPendingRequests();
      setPendingRequests(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendRequest = async (userId: number) => {
    try {
      await sendFriendRequest(userId);
      toast({ title: 'Friend Request Sent' });
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      fetchPending();
    } catch (error) {
      toast({ title: 'Failed to send request', variant: 'destructive' });
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await acceptFriendRequest(requestId);
      toast({ title: 'Friend Request Accepted' });
      fetchFriends();
      fetchPending();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectFriendRequest(requestId);
      toast({ title: 'Friend Request Rejected' });
      fetchPending();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length > 1) {
      const results = await searchUsers(searchQuery.trim());
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Friends</h1>
        <p className="text-muted-foreground">Connect with friends and challenge them to games</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Your Friends */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Pending Requests</h3>
                  <div className="space-y-4">
                    {pendingRequests.map((req) => (
                      <Card key={req.id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-bold">{req.from_user.full_name}</p>
                          <p className="text-sm text-muted-foreground">@{req.from_user.username}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleAccept(req.id)} size="sm">Accept</Button>
                          <Button variant="outline" onClick={() => handleReject(req.id)} size="sm">Reject</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <Card key={friend.id} className="p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <SafeAvatar src={friend.profile_picture} fallback={friend.full_name} size="sm" />
                          <div>
                            <p className="font-bold">{friend.full_name}</p>
                            <p className="text-sm text-muted-foreground">@{friend.username}</p>
                          </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/profile/${friend.id}`}
                      >
                        View Profile
                      </Button>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No friends found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add New Friends */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Add New Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex mb-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name or username"
                  className="mr-2"
                />
                <Button variant="outline" onClick={handleSearch}>
                  <UserPlus size={16} className="mr-1" /> Search
                </Button>
              </div>

              <div className="space-y-3">
                {searchResults.map((user) => (
                  <Card key={user.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                    <Button onClick={() => handleSendRequest(user.id)} size="sm">
                      <UserPlus size={16} className="mr-1" /> Add
                    </Button>
                  </Card>
                ))}
                {searchQuery && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground">No users found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Add Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Find and add friends to challenge them to games and track scores together.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Friends;
