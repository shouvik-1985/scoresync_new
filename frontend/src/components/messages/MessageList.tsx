import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import axios from '@/services/axiosInstance';
import { useAuth } from '@/hooks/use-auth';

export interface MessageData {
  id: number;
  sender: {
    id: number;
    full_name: string;
    profile_picture: string;
  };
  receiver: {
    id: number;
    full_name: string;
    profile_picture: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
}

interface MessageListProps {
  onSelectConversation?: (message: MessageData) => void;
}

const MessageList = ({ onSelectConversation }: MessageListProps) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get('/friends/messages/recent/');
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };
    fetchMessages();
  }, []);

  const filtered = messages.filter(
    (m) =>
      (m.sender.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       m.receiver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center relative mb-4">
        <Search size={18} className="absolute left-3 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filtered.map((msg) => {
        const otherUser = msg.sender.id === currentUser?.id ? msg.receiver : msg.sender;
        return (
          <Card
            key={msg.id}
            className="p-4 hover:bg-accent transition-colors cursor-pointer"
            onClick={() => onSelectConversation?.(msg)}
          >
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src={otherUser.profile_picture} />
                <AvatarFallback>{otherUser.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">{otherUser.full_name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.timestamp))} ago
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MessageList;
