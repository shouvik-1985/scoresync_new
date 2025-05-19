
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import MessageList, { MessageData } from '@/components/messages/MessageList';
import MessageComposer from '@/components/messages/MessageComposer';
import ChatDialog from '@/components/messages/ChatDialog';
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const [isComposerOpen, setIsComposerOpen] = React.useState(false);
  const [selectedConversation, setSelectedConversation] = React.useState<MessageData | null>(null);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSelectConversation = (conversation: MessageData) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    // Mark as read if needed
    if (selectedConversation?.unread) {
      toast({
        title: "Message marked as read",
        description: `Conversation with ${selectedConversation.sender.name} marked as read.`,
      });
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Chat with your friends and opponents
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Messages</h2>
        <Button 
          className="bg-scoresync-blue hover:bg-scoresync-blue/90"
          onClick={() => setIsComposerOpen(true)}
        >
          <Plus size={16} className="mr-1" /> New Message
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare size={18} className="mr-2 text-scoresync-blue" />
            Your Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MessageList onSelectConversation={handleSelectConversation} />
        </CardContent>
      </Card>

      <MessageComposer 
        open={isComposerOpen}
        onOpenChange={setIsComposerOpen}
      />

      <ChatDialog 
        open={isChatOpen}
        onOpenChange={handleChatClose}
        conversation={selectedConversation}
      />
    </Layout>
  );
};

export default Messages;
