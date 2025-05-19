import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AddScore from "./pages/AddScore";
import Scores from "./pages/Scores";
import Friends from "./pages/Friends";
import Messages from "./pages/Messages";
import Challenges from "./pages/Challenges";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PrivateRoute from "./PrivateRoute";
import SubmitMatch from './pages/SubmitMatch';
import LiveMatchPage from "./pages/LiveMatchPage";
import NewMatchPage from "./pages/NewMatchPage";
import LiveMatchPageGuest from "./pages/LiveMatchPageGuest";
import GuestMatchDetails from "./pages/GuestMatchDetails";
import ChallengeMatchDetails from "./pages/ChallengeMatchDetails";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/challenges/:challengeId/submit-match" element={<SubmitMatch />} />
          <Route path="/scores/guest-match/:matchId" element={<LiveMatchPageGuest />} />
          <Route path="/scores/guest-match/details/:matchId" element={<GuestMatchDetails />} />
          <Route path="/challenges/match/:id" element={<ChallengeMatchDetails />} />




          {/* Protected Routes (Require Login) */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/scores" element={<PrivateRoute><Scores /></PrivateRoute>} />
          <Route path="/friends" element={<PrivateRoute><Friends /></PrivateRoute>} />
          <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/add-score" element={<PrivateRoute><AddScore /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} /> 
          <Route path="/scores/match/:id" element={<LiveMatchPage />} />
          <Route path="/new-match" element={<PrivateRoute><NewMatchPage /></PrivateRoute>} />


          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
