import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import axios from '@/services/axiosInstance';

interface Friend {
  id: number;
  full_name: string;
  profile_picture: string;
}

interface MessageComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessageComposer = ({ open, onOpenChange }: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [step, setStep] = useState<'select' | 'compose'>('select');

  useEffect(() => {
    if (open) {
      axios.get('/friends/list/')
        .then(res => setFriends(res.data))
        .catch(err => console.error("Failed to load friends", err));
    }
  }, [open]);

  const handleSend = async () => {
    if (!message.trim() || !selectedFriend) return;
    try {
      await axios.post('/friends/messages/send/', {
        to_user: selectedFriend.id,
        message: message.trim()
      });
      setMessage("");
      setSelectedFriend(null);
      setStep('select');
      onOpenChange(false);
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedFriend(null);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {step === 'select' ? 'New Message' : `Message to ${selectedFriend?.full_name}`}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          {step === 'select' ? (
            <div className="space-y-2">
              {friends.map(friend => (
                <Button
                  key={friend.id}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedFriend(friend);
                    setStep('compose');
                  }}
                >
                  {friend.full_name}
                </Button>
              ))}
            </div>
          ) : (
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] mb-4"
            />
          )}
        </div>
        <DrawerFooter className="flex-row gap-2 justify-end">
          {step === 'compose' && (
            <>
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button
                onClick={handleSend}
                className="bg-scoresync-blue hover:bg-scoresync-blue/90"
              >
                <Send size={16} className="mr-2" /> Send Message
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MessageComposer;
