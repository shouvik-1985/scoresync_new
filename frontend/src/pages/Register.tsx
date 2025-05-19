import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "@/services/axiosInstance";
import { saveAuthData } from "@/services/auth";
import { Toaster, toast } from "@/components/ui/sonner";

// Firebase config
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
const storage = getStorage(app);
const auth = getAuth(app);

// Available games
const gameOptions = [
  "Football",
  "Cricket",
  "Basketball",
  "Tennis",
  "Badminton",
  "Hockey",
  "Chess",
];

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Sending registration request with data:", {
        email,
        username,
        full_name: fullName,
      });

      const response = await axios.post("/register/", {
        email,
        password,
        username,
        full_name: fullName,
        bio,
        games: JSON.stringify(selectedGames),
      });

      console.log("Registration response:", response.data);
      saveAuthData(response.data.token, response.data);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.error || "Registration failed!");
    }
  };

  const handleGameSelect = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter(g => g !== game));
    } else {
      setSelectedGames([...selectedGames, game]);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await axios.post("/google-signin/", { id_token: idToken });
      saveAuthData(response.data.token, response.data);
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
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 border rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <textarea
            placeholder="Bio (optional)"
            className="w-full p-3 border rounded-lg"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
          >
            Register
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
          type="button"
          className="w-full flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" className="w-6 h-6" />
          <span className="font-medium text-gray-700">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Register;
