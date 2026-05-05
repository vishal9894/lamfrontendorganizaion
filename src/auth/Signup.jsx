import axios from "axios";
import { useState } from "react";



const BaseUrl = import.meta.env.VITE_BACKEND_API;

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${BaseUrl}/auth/signup`, form, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        error.response?.data?.message || "An error occurred during signup",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-8 text-white">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
              <HiOutlineUser className="text-3xl text-indigo-300" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Sign up to get started with your account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/30 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Full Name
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-indigo-400">
                <HiOutlineUser className="text-xl text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-transparent px-3 py-3 text-white placeholder:text-slate-400 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Email Address
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-indigo-400">
                <HiOutlineMail className="text-xl text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full bg-transparent px-3 py-3 text-white placeholder:text-slate-400 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-indigo-400">
                <HiOutlineLockClosed className="text-xl text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full bg-transparent px-3 py-3 text-white placeholder:text-slate-400 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-500 py-3 font-semibold text-white transition hover:bg-indigo-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            Already have an account?{" "}
            <span className="cursor-pointer font-semibold text-indigo-300 hover:text-indigo-200">
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
