import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import axios from "@/services/axiosInstance";
import { saveAuthData } from "@/services/auth";
import { Toaster, toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";

// Firebase config (use your config here)
const firebaseConfig = {
  apiKey: "AIzaSyDM4P96ZUTRn-unirz1fZVRPJNByMAWdAc",
  authDomain: "scoresync-3ce4c.firebaseapp.com",
  projectId: "scoresync-3ce4c",
  storageBucket: "scoresync-3ce4c.appspot.com",
  messagingSenderId: "644724320982",
  appId: "1:644724320982:web:53ab5afb21f54ba1f83777",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/login/", { email, password });
      saveAuthData(response.data.token, response.data); // Save token + user data
      setUser(response.data); // <-- Set user in context
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Login failed!");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await axios.post("/google-signin/", { id_token: idToken });
      saveAuthData(response.data.token, response.data);
      setUser(response.data); // <-- Set user in context
      toast.success("Google Sign-In successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Google Sign-In failed!");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-to-br from-blue-50 to-white">
      <Toaster />
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Login to ScoreSync</h1>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailPasswordLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t"></div>
          <span className="mx-3 text-gray-400">OR</span>
          <div className="flex-grow border-t"></div>
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" className="w-6 h-6" />
          <span className="font-medium text-gray-700">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
