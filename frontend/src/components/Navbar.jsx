import { Link, NavLink, useNavigate } from "react-router-dom";
import { History, ListTodo, Plus, LogOut, LogIn, User } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("[Logout failed]", err);
    }
  }

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span className="brand-mark">സ</span>
        <span>സമയമുണ്ട്</span>
      </Link>
      <nav>
        {user ? (
          <>
            <NavLink to="/tasks"><ListTodo size={17} /> Tasks</NavLink>
            <NavLink to="/history"><History size={17} /> History</NavLink>
            <NavLink className="nav-cta" to="/set-task"><Plus size={17} /> Set Task</NavLink>
            <div className="nav-user-badge" title={user.email}>
              <User size={14} />
              <span>{user.email?.split("@")[0]}</span>
            </div>
            <button className="nav-logout-btn" onClick={handleLogout} title="Log out">
              <LogOut size={16} />
              <span className="logout-text">Logout</span>
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login"><LogIn size={16} /> Log In</NavLink>
            <NavLink className="nav-cta" to="/signup">Sign Up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
