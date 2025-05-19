
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Users, MessageSquare } from 'lucide-react';

const MobileNavbar = () => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-scoresync-border z-50 md:hidden">
      <div className="grid grid-cols-5">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center py-3 hover:text-scoresync-blue ${location.pathname === '/' ? 'text-scoresync-blue' : 'text-scoresync-black'}`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link 
          to="/scores" 
          className={`flex flex-col items-center justify-center py-3 hover:text-scoresync-blue ${location.pathname === '/scores' ? 'text-scoresync-blue' : 'text-scoresync-black'}`}
        >
          <Trophy size={24} />
          <span className="text-xs mt-1">Scores</span>
        </Link>
        <Link to="/add-score" className="flex flex-col items-center justify-center py-3">
          <div className="bg-scoresync-blue text-white rounded-full w-12 h-12 flex items-center justify-center -mt-5 shadow-lg">
            <span className="text-2xl font-bold">+</span>
          </div>
        </Link>
        <Link 
          to="/friends" 
          className={`flex flex-col items-center justify-center py-3 hover:text-scoresync-blue ${location.pathname === '/friends' ? 'text-scoresync-blue' : 'text-scoresync-black'}`}
        >
          <Users size={24} />
          <span className="text-xs mt-1">Friends</span>
        </Link>
        <Link 
          to="/messages" 
          className={`flex flex-col items-center justify-center py-3 hover:text-scoresync-blue ${location.pathname === '/messages' ? 'text-scoresync-blue' : 'text-scoresync-black'}`}
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Chat</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavbar;
