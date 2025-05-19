// frontend/src/components/social/FriendsList.tsx

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { getFriendList } from "@/services/friendService";
import { useAuth } from "@/hooks/use-auth";

interface Friend {
  user_id: number;
  full_name: string;
  username: string;
  profile_picture: string;
  games: string[];
  status?: 'online' | 'offline' | 'busy'; // optional
}

interface FriendsListProps {
  onSelectFriend?: (friend: Friend) => void;
  searchQuery?: string;
}

const FriendsList = ({ onSelectFriend, searchQuery = '' }: FriendsListProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'busy'>('all');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getFriendList(); // only accepted friends
        const enriched = response.data
          .filter((f: any) => f.user_id !== currentUser?.id)
          .map((f: any) => ({ ...f, status: 'online' })); // dummy status
        setFriends(enriched);
      } catch (error) {
        console.error("Error fetching friends", error);
      }
    };

    fetchFriends();
  }, [currentUser?.id]);

  const handleFriendClick = (friend: Friend) => {
    if (onSelectFriend) {
      onSelectFriend(friend);
    } else {
      navigate(`/profile/${friend.user_id}`);
    }
  };

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || friend.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {['all', 'online', 'offline', 'busy'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`px-3 py-1 rounded-full text-sm ${
              statusFilter === status
                ? 'bg-scoresync-blue text-white'
                : 'bg-accent text-muted-foreground'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredFriends.length === 0 ? (
          <p className="text-sm text-muted-foreground">No friends found.</p>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.user_id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-scoresync-lightGray cursor-pointer"
              onClick={() => handleFriendClick(friend)}
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={friend.profile_picture || "https://via.placeholder.com/150"} />
                  <AvatarFallback>{friend.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white 
                  ${friend.status === 'online' ? 'bg-scoresync-green' : 
                    friend.status === 'busy' ? 'bg-scoresync-orange' : 'bg-gray-300'}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{friend.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{friend.username}</p>
                {friend.games?.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate">
                    Games: {friend.games.join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendsList;
