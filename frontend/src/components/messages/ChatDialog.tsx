import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from "lucide-react";
import { MessageData } from './MessageList';
import axios from '@/services/axiosInstance';
import { useAuth } from '@/hooks/use-auth';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: MessageData | null;
}

const ChatDialog = ({ open, onOpenChange, conversation }: ChatDialogProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<MessageData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const friendId =
    user?.id === conversation?.sender.id
      ? conversation?.receiver.id
      : conversation?.sender.id;

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadMessages = async () => {
    if (open && friendId) {
      try {
        const res = await axios.get(`/friends/messages/chat/${friendId}/`);
        setChatHistory(res.data);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to load chat", err);
      }
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [open, friendId]);

  const handleSend = async () => {
    if (!message.trim() || !friendId) return;
    try {
      const res = await axios.post('/friends/messages/send/', {
        to_user: friendId,
        message: message.trim()
      });
      setChatHistory((prev) => [...prev, res.data]);
      setMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  if (!conversation) return null;

  const friend = user?.id === conversation.sender.id
    ? conversation.receiver
    : conversation.sender;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={friend.profile_picture} />
              <AvatarFallback>{friend.full_name[0]}</AvatarFallback>
            </Avatar>
            {friend.full_name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[350px] mb-4">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/20 rounded-md">
            {chatHistory.map((msg) => {
              const isMe = msg.sender.id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={msg.sender.profile_picture} />
                      <AvatarFallback>{msg.sender.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`p-3 rounded-lg max-w-[75%] text-sm ${isMe ? 'bg-scoresync-blue text-white' : 'bg-white border'}`}>
                      <p>{msg.content}</p>
                      <span className="text-xs block mt-1 opacity-70 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Type your message..."
            className="min-h-[80px] resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            className="h-full bg-scoresync-blue hover:bg-scoresync-blue/90"
            onClick={handleSend}
          >
            <Send size={18} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
