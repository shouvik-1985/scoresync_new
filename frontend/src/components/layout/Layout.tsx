import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import MobileNavbar from './MobileNavbar';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import axios from '@/services/axiosInstance';
import { getFriendList } from '@/services/friendService';

interface User {
  user_id: number;
  username: string;
  full_name: string;
  profile_picture: string;
  games: string[];
  bio: string;
}

interface LayoutProps {
  children: React.ReactNode;
  sidebarUser?: User | null;
  sidebarFriends?: User[];
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
  sidebarStats?: any;
}

const Layout = ({
  children,
  sidebarUser,
  sidebarFriends,
  notifications = {},
  sidebarStats = null,
}: LayoutProps) => {
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<User | null>(sidebarUser ?? null);
  const [friends, setFriends] = useState<User[]>(sidebarFriends ?? []);

  useEffect(() => {
    if (!sidebarUser) fetchCurrentUser();
    if (!sidebarFriends?.length) fetchFriends();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/auth/me/');
      setCurrentUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await getFriendList();
      setFriends(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-scoresync-lightGray">
      <Navbar notifications={notifications} />

      <div className="flex flex-1 pt-16">
        {!isMobile && <Sidebar user={currentUser} friends={friends} stats={sidebarStats} />}

        <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {isMobile && <MobileNavbar />}
    </div>
  );
};

export default Layout;
