import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

import LoadingState from "../components/ui/LoadingStates";

const BaseUrl = import.meta.env.VITE_BACKEND_API;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BaseUrl}/admin/org-login`, {
        email,
        password,
      });

      const data = response.data;

      toast.success(data.message);

      if (data.token) {
        localStorage.setItem("authToken", data.token);

        const destination = from === "/" ? "/dashboard" : from;

        setTimeout(() => {
          navigate(destination, {
            replace: true,
          });
        }, 1000);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  // If loading is true, only show LoadingState
  if (loading) {
    return (
      <LoadingState 
        variant="full_page"
        message="Signing in..."
        subMessage="Please wait while we authenticate your account"
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] flex items-center justify-center px-4">
      {/* Background Blur */}
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-indigo-300/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-pink-300/40 rounded-full blur-3xl" />

      {/* Login Card */}
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-[32px] p-8">
          {/* Logo */}
          <motion.div
            initial={{
              scale: 0,
              rotate: -180,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
            }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white w-10 h-10" />
            </div>
          </motion.div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Login to continue to your LMS
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white px-12 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white px-12 pr-14 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-indigo-300/50 transition-all flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight size={18} />
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Secure login portal for your organization
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;