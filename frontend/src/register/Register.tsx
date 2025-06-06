import "../animations/shake.css";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      triggerShake();
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error en el registro");
      }

      navigate("/login", { state: { from: "/register" } });
    } catch (err: any) {
      setError(err.message || "Unknown error");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const goBack = () => {
    if (from) navigate(from);
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col items-center justify-center px-4 relative">
      <button
        onClick={goBack}
        className="absolute top-5 left-5 bg-[#00d9ff] text-[#1e1e1e] px-4 py-2 rounded-md font-bold hover:bg-[#00a6c4] transition"
      >
        ⬅ Return
      </button>

      <button
        onClick={() => navigate("/")}
        className="absolute top-5 left-[135px] bg-[#00d9ff] text-[#1e1e1e] px-4 py-2 rounded-md font-bold hover:bg-[#00a6c4] transition"
      >
        🏠
      </button>

      <h2 className="text-4xl font-bold text-[#00d9ff] mb-8 mt-12">Register</h2>

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-6 w-full max-w-md bg-[#2a2a2a] p-8 rounded-lg shadow-md"
      >
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-4 py-3 rounded-md bg-[#1e1e1e] border border-[#00d9ff] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d9ff]"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-4 py-3 rounded-md bg-[#1e1e1e] border border-[#00d9ff] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d9ff]"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="px-4 py-3 rounded-md bg-[#1e1e1e] border border-[#00d9ff] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d9ff]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-md bg-[#1e1e1e] border border-[#00d9ff] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d9ff]"
        />
        <input
          type="password"
          placeholder="Repeat Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-md bg-[#1e1e1e] border border-[#00d9ff] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d9ff]"
        />
        <button
          type="submit"
          className="bg-[#00d9ff] text-[#1e1e1e] py-3 px-6 rounded-md font-bold hover:bg-[#00a6c4] transition"
        >
          Register
        </button>

        <div className="text-center text-sm text-gray-400">
          or{" "}
          <span
            onClick={() => navigate("/login", { state: { from: location.pathname } })}
            className="text-[#00d9ff] cursor-pointer hover:underline font-semibold"
          >
            Sign in
          </span>
        </div>

        {error && (
          <p
            className={`text-red-500 text-sm font-semibold text-center ${
              shake ? "shake" : ""
            }`}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default Register;

