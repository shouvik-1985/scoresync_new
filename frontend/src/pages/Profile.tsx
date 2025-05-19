import { useEffect, useState } from 'react';
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, Award, UserX, UserCheck, GamepadIcon } from "lucide-react";
import axios from "@/services/axiosInstance";
import { useAuth } from "@/hooks/use-auth";
import { blockUser, unblockUser } from "@/services/friendService";
import SafeAvatar from "@/components/ui/SafeAvatar";
import { motion } from "framer-motion";

interface ProfileData {
  user_id?: number;
  full_name: string;
  username: string;
  email: string;
  bio: string;
  games: (string | { name: string })[];
  profile_picture: string;
  is_blocked_by_me?: boolean;
}

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, games_played: 0 });

  const isCurrentUser = !userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(isCurrentUser ? "/profile/" : `/users/${userId}/`);
        setProfile(response.data);
        setBlocked(response.data.is_blocked_by_me || false);

        const resolvedUserId = userId ?? response.data.user_id;
        const statsRes = await axios.get(`/games/matches/users/${resolvedUserId}/stats/`);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleBlock = async () => {
    if (!profile?.user_id) return;
    try {
      await blockUser(profile.user_id);
      setBlocked(true);
    } catch (error) {
      console.error("Failed to block user", error);
    }
  };

  const handleUnblock = async () => {
    if (!profile?.user_id) return;
    try {
      await unblockUser(profile.user_id);
      setBlocked(false);
    } catch (error) {
      console.error("Failed to unblock user", error);
    }
  };

  if (loading) return (
    <div className="h-screen flex justify-center items-center">
      <div className="animate-pulse flex space-x-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-3 h-3 bg-scoresync-blue rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
        ))}
      </div>
    </div>
  );
  
  if (!profile) return (
    <div className="h-screen flex justify-center items-center">
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-xl shadow-lg">
        <div className="text-red-500 text-6xl mb-4">😕</div>
        <p className="text-red-500 font-medium text-xl">Profile not found</p>
        <p className="text-red-400 mt-2">The requested profile does not exist or is unavailable.</p>
        <Button className="mt-6" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-8 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full filter blur-[120px]"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px]"></div>
        </div>

        <div className="container relative z-10 max-w-6xl mx-auto px-4 py-8">
          <div className="mb-10 max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-2 text-white tracking-tight">
              {isCurrentUser ? "Your Profile" : "User Profile"}
            </h1>
            <p className="text-slate-400 text-lg">
              {isCurrentUser ? "View and manage your profile information" : `Viewing ${profile.full_name}'s profile`}
            </p>
          </div>

          {/* Main card with glassmorphism effect */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto rounded-2xl overflow-hidden mb-20"
          >
            <div className="glassmorphism-card p-8">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                {/* Avatar section with 3D effect */}
                <div className="profile-avatar-container">
                  <div className="profile-avatar-wrapper">
                    <SafeAvatar
                      src={profile?.profile_picture}
                      fallback={profile?.full_name?.[0] || "U"}
                      size="lg"
                      className="profile-avatar"
                    />
                  </div>
                  
                  {/* Action buttons */}
                  <div className="mt-6 w-full flex justify-center">
                    {isCurrentUser ? (
                      <Button
                        onClick={() => navigate("/profile/edit")}
                        className="neon-button"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button
                        className={blocked ? "unblock-button" : "block-button"}
                        onClick={blocked ? handleUnblock : handleBlock}
                      >
                        {blocked ? <UserCheck size={16} className="mr-2" /> : <UserX size={16} className="mr-2" />}
                        {blocked ? "Unblock User" : "Block User"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Profile information */}
                <div className="flex-1">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-1">{profile.full_name}</h2>
                    <p className="text-blue-400 text-lg mb-6">@{profile.username}</p>
                    
                    {profile.bio && (
                      <div className="mb-6">
                        <p className="text-slate-300 italic text-lg">{profile.bio}</p>
                      </div>
                    )}
                    
                    {/* Games section */}
                    {Array.isArray(profile.games) && profile.games.length > 0 && (
                      <div className="games-container mb-8">
                        <h3 className="text-lg font-medium text-slate-300 mb-3 flex items-center">
                          <GamepadIcon size={18} className="mr-2 text-blue-400" />
                          Gaming Library
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.games
                            .map((g: any) => typeof g === "string" ? g : (g?.name || ""))
                            .filter(name => name)
                            .map((name, index) => (
                              <span key={index} className="game-tag">
                                {name}
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Stats section in a bento grid layout */}
                    <div className="stats-grid">
                      <div className="stat-box games-played">
                        <div className="stat-icon">🎮</div>
                        <div className="stat-value">{stats.games_played}</div>
                        <div className="stat-label">Games Played</div>
                      </div>
                      
                      <div className="stat-box wins">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-value">{stats.wins}</div>
                        <div className="stat-label">Victories</div>
                      </div>
                      
                      <div className="stat-box losses">
                        <div className="stat-icon">💔</div>
                        <div className="stat-value">{stats.losses}</div>
                        <div className="stat-label">Defeats</div>
                      </div>
                      
                      <div className="stat-box win-rate">
                        <div className="stat-icon">📊</div>
                        <div className="stat-value">
                          {stats.games_played > 0 ? 
                            `${Math.round((stats.wins / stats.games_played) * 100)}%` : 
                            '0%'}
                        </div>
                        <div className="stat-label">Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CSS for custom styling */}
      <style >{`
        .glassmorphism-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .profile-avatar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .profile-avatar-wrapper {
          position: relative;
          width: 160px;
          height: 160px;
          perspective: 1000px;
          transition: transform 0.5s ease;
        }
        
        .profile-avatar-wrapper:hover {
          transform: scale(1.05);
        }
        
        .profile-avatar {
          width: 160px !important;
          height: 160px !important;
          border: 3px solid rgba(59, 130, 246, 0.6);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          transition: all 0.3s ease;
        }
        
        .neon-button {
          background: linear-gradient(45deg, rgb(24, 97, 207), rgb(44, 130, 255));
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: all 0.3s ease;
        }
        
        .neon-button:hover {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          transform: translateY(-2px);
        }
        
        .block-button {
          background: linear-gradient(45deg, rgb(187, 37, 37), rgb(220, 38, 38));
          border: none;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
          transition: all 0.3s ease;
        }
        
        .block-button:hover {
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.8);
          transform: translateY(-2px);
        }
        
        .unblock-button {
          background: linear-gradient(45deg, rgb(21, 128, 61), rgb(34, 197, 94));
          border: none;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
          transition: all 0.3s ease;
        }
        
        .unblock-button:hover {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
          transform: translateY(-2px);
        }
        
        .game-tag {
          display: inline-block;
          padding: 6px 12px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          color: rgb(147, 197, 253);
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        
        .game-tag:hover {
          background: rgba(59, 130, 246, 0.25);
          transform: translateY(-2px);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 20px;
        }
        
        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .stat-box:hover {
          transform: translateY(-5px);
        }
        
        .games-played {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2));
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .wins {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2));
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .losses {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2));
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .win-rate {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.2));
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        
        .stat-icon {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: rgb(148, 163, 184);
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </Layout>
  );
};

export default Profile;
