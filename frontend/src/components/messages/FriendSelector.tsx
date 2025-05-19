
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Using the same friend data as in FriendsList
const friends = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: 'sarahj',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'online',
  },
  {
    id: '2',
    name: 'Mike Peters',
    username: 'mikep',
    avatar: 'https://i.pravatar.cc/150?img=8',
    status: 'online',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    username: 'emmaw',
    avatar: 'https://i.pravatar.cc/150?img=5',
    status: 'offline',
  },
  {
    id: '4',
    name: 'David Brown',
    username: 'davidb',
    avatar: 'https://i.pravatar.cc/150?img=4',
    status: 'busy',
  },
];

interface FriendSelectorProps {
  onSelectFriend: (friend: any) => void;
}

const FriendSelector = ({ onSelectFriend }: FriendSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFriends = friends.filter(
    friend => 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center relative">
        <Search size={18} className="absolute left-3 text-muted-foreground" />
        <Input 
          placeholder="Search friends..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredFriends.map((friend) => (
          <Card 
            key={friend.id} 
            className="p-3 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => onSelectFriend(friend)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white 
                  ${friend.status === 'online' ? 'bg-scoresync-green' : 
                    friend.status === 'busy' ? 'bg-scoresync-orange' : 'bg-gray-300'}`}
                />
              </div>
              <div>
                <p className="font-medium">{friend.name}</p>
                <p className="text-xs text-muted-foreground">@{friend.username}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FriendSelector;
