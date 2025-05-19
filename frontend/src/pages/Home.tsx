import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const Home = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-6"
    >
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: "#4f46e5" },
            opacity: { value: 0.3, random: true },
            size: { value: 3, random: true },
            line_linked: {
              enable: true, 
              distance: 150, 
              color: "#3B82F6", 
              opacity: 0.2
            },
            move: { enable: true, speed: 0.8, random: true },
          },
          interactivity: {
            events: {
              onhover: { enable: true, mode: "grab" },
              onclick: { enable: true, mode: "push" }
            }
          }
        }}
        className="absolute inset-0 z-0"
      />

      {/* Main Content Container */}
      <motion.div 
        className="relative z-10 backdrop-blur-lg bg-white/10 p-8 md:p-12 rounded-2xl shadow-2xl border border-white/30 w-full max-w-2xl flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(1000px) 
            rotateX(${(mousePosition.y - 0.5) * 5}deg) 
            rotateY(${(mousePosition.x - 0.5) * -5}deg)`,
        }}
      >
        {/* Logo with Animation */}
        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <img 
            src="/logo_placeholder.png" 
            alt="ScoreSync Logo" 
            className="w-24 h-24 relative z-10"
          />
        </motion.div>

        {/* Animated Heading */}
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 text-transparent bg-clip-text bg-size-200 animate-gradient-x">
            Welcome to ScoreSync!
          </span>
        </motion.h1>

        {/* Floating Subheading */}
        <motion.p 
          className="text-lg md:text-2xl text-gray-200 text-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.8,
            delay: 0.3
          }}
        >
          Play, Challenge, and Connect with Friends
        </motion.p>

        {/* Animated Buttons */}
        <motion.div 
          className="flex flex-wrap gap-6 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <motion.button 
            onClick={() => navigate("/register")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <span className="relative z-10">Register</span>
            <motion.span 
              className="absolute inset-0 -z-10 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-40"
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          <motion.button 
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <span className="relative z-10">Login</span>
            <motion.span 
              className="absolute inset-0 -z-10 bg-gray-500 rounded-full blur-md opacity-0 group-hover:opacity-40"
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 rounded-full bg-white/30 backdrop-blur-md"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, `${Math.random() * 100}%`, null],
              x: [null, `${Math.random() * 100}%`, null],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "mirror"
            }}
          />
        ))}
      </div>

      {/* Animated Footer */}
      <motion.p 
        className="mt-12 text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        © 2025 ScoreSync. All rights reserved.
      </motion.p>

      {/* Global Animations */}
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
