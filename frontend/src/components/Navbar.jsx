import { Link, NavLink } from "react-router-dom";
import { BrainCircuit, History, ListTodo, Plus } from "lucide-react";

export default function Navbar() {
  return <header className="nav">
    <Link className="brand" to="/"><span className="brand-mark">സ</span><span>സമയമുണ്ട്</span></Link>
    <nav>
      <NavLink to="/tasks"><ListTodo size={17}/> Tasks</NavLink>
      <NavLink to="/history"><History size={17}/> History</NavLink>
      <NavLink className="nav-cta" to="/set-task"><Plus size={17}/> Set Task</NavLink>
    </nav>
  </header>;
}
