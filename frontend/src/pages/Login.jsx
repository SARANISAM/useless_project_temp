import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, KeyRound, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  // If already logged in, redirect immediately
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email enter cheyyu bro. 😂");
      return;
    }
    if (!password) {
      setError("Password enter cheyyu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      console.error("[Login error]", err);
      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Nannaayi aalochichu nokku. 🫠");
      } else if (err.message?.includes("Forbidden use of secret API key")) {
        setError("Config Error: frontend/.env has a secret key ('sb_secret_...'). Replace it with the public 'anon' key from Supabase Dashboard > Project Settings > API!");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="narrow">
      <div className="page-heading">
        <div className="pill">SUPABASE AUTH</div>
        <h1>Log In. Procrastinate Later. 😌</h1>
        <p>Productivity alla… <b>procrastination optimize cheyyam.</b></p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <label>
          Email address *
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="procrastinator@cet.ac.in"
              required
              autoComplete="email"
            />
          </div>
        </label>

        <label>
          Password *
          <div className="input-with-icon">
            <KeyRound size={18} className="input-icon" />
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
        </label>

        <button className="primary big full" disabled={loading}>
          <LogIn size={19} />
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="auth-footer-link">
          <span>Account ille? </span>
          <Link to="/signup" className="auth-link">
            Sign up here 🚀
          </Link>
        </div>
      </form>
    </main>
  );
}
