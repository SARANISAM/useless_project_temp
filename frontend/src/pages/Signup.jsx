import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, KeyRound, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessInfo("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimum 6 characters venam. 🔒");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords match aavunnilla bro! Re-check cheyyu. 🫠");
      return;
    }

    setLoading(true);

    try {
      const data = await signUp({ email, password });
      
      // If session is returned immediately (email confirmation disabled)
      if (data?.session) {
        navigate("/", { replace: true });
      } else {
        // If email confirmation is required by Supabase project settings
        setSuccessInfo(
          "Account create aayi! 📩 Check your email inbox and click the confirmation link to complete signup, then Log In."
        );
      }
    } catch (err) {
      console.error("[Signup error]", err);
      if (err.message?.includes("User already registered")) {
        setError("Ee email-il already account undu. Log in cheythoode? 😂");
      } else if (err.message?.includes("Forbidden use of secret API key")) {
        setError("Config Error: frontend/.env has a secret key ('sb_secret_...'). Replace it with the public 'anon' key from Supabase Dashboard > Project Settings > API!");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="narrow">
      <div className="page-heading">
        <div className="pill">NEW ACCOUNT</div>
        <h1>Join Samayamundu. 🚀</h1>
        <p>Productivity alla… <b>procrastination optimize cheyyam.</b></p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="auth-alert success">
            <CheckCircle2 size={18} />
            <span>{successInfo}</span>
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
              placeholder="Minimum 6 characters"
              required
              autoComplete="new-password"
            />
          </div>
        </label>

        <label>
          Confirm Password *
          <div className="input-with-icon">
            <KeyRound size={18} className="input-icon" />
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />
          </div>
        </label>

        <button className="primary big full" disabled={loading}>
          <UserPlus size={19} />
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <div className="auth-footer-link">
          <span>Already have an account? </span>
          <Link to="/login" className="auth-link">
            Log in here ✨
          </Link>
        </div>
      </form>
    </main>
  );
}
