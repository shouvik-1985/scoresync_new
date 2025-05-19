import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { acceptFriendRequest, rejectFriendRequest } from "@/services/friendService";
import { toast } from "@/components/ui/use-toast";

interface NotificationsPopoverProps {
  notifications?: {
    incoming?: {
      id: number;
      from_user: {
        full_name: string;
        username: string;
        profile_picture: string;
      };
      created_at: string;
    }[];
    accepted?: {
      id: number;
      to_user: {
        full_name: string;
        username: string;
        profile_picture: string;
      };
      created_at: string;
    }[];
  };
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ notifications = {} }) => {
  const incoming = notifications.incoming || [];
  const accepted = notifications.accepted || [];
  const unreadCount = incoming.length + accepted.length;

  const handleAccept = async (id: number) => {
    try {
      await acceptFriendRequest(id);
      toast({ title: "Friend request accepted" });
    } catch {
      toast({ title: "Failed to accept request", variant: "destructive" });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectFriendRequest(id);
      toast({ title: "Friend request rejected" });
    } catch {
      toast({ title: "Failed to reject request", variant: "destructive" });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-scoresync-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
        </div>
        <ScrollArea className="h-[320px]">
          <div className="divide-y">
            {incoming.map((n) => (
              <div key={n.id} className="p-4 bg-accent/10">
                <p className="text-sm font-medium mb-1">
                  {n.from_user.full_name} sent you a friend request
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleAccept(n.id)} className="bg-green-600 hover:bg-green-700 text-white">
                    Accept
                  </Button>
                  <Button size="sm" onClick={() => handleReject(n.id)} variant="destructive">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {accepted.map((n) => (
              <div key={n.id} className="p-4">
                <p className="text-sm">
                  {n.to_user.full_name} accepted your friend request
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
            {unreadCount === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No new notifications
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
