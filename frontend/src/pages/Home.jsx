import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Clock3, Flame, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import EmergencyButton from "../components/EmergencyButton.jsx";

export default function Home({ onToast }) {
  const [stats, setStats] = useState(null);
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { api.stats().then(r => setStats(r.data)).catch(e => onToast(e.message)); }, []);
  async function help() {
    setLoading(true); setEmergency(null);
    try { const r = await api.emergency(); setEmergency(r.data); }
    catch (e) { onToast(e.message); } finally { setLoading(false); }
  }
  return <main>
    <section className="hero">
      <div className="hero-copy">
        <div className="pill">AI-POWERED PROCRASTINATION ENGINE</div>
        <h1>സമയമുണ്ട് <span>😂</span></h1>
        <p>Productivity alla… <b>procrastination optimize cheyyam.</b></p>
        <div className="hero-actions"><Link className="primary big" to="/set-task"><Plus size={20}/> Set Task</Link><Link className="secondary big" to="/tasks">View Tasks <ArrowRight size={18}/></Link></div>
      </div>
      <div className="hero-orb"><BrainCircuit size={78}/><span>Deadline knows.</span><strong>AI explains why you're fine.</strong></div>
    </section>
    <section className="stats-grid">
      <div className="stat"><Clock3/><span>Tasks Today</span><strong>{stats?.today ?? "—"}</strong></div>
      <div className="stat"><ArrowRight/><span>Upcoming</span><strong>{stats?.upcoming ?? "—"}</strong></div>
      <div className="stat"><Flame/><span>Overdue</span><strong>{stats?.overdue ?? "—"}</strong></div>
      <div className="stat"><BrainCircuit/><span>Completed</span><strong>{stats?.completed ?? "—"}</strong></div>
    </section>
    <section className="emergency-panel">
      <div><div className="eyebrow">WHEN EVERYTHING IS FINE*</div><h2>Emergency procrastination rescue</h2><p>*Everything is probably not fine.</p></div>
      <EmergencyButton onClick={help} loading={loading}/>
    </section>
    {emergency && <section className="emergency-result"><div className="eyebrow">🚨 EMERGENCY AI</div><h2>{emergency.headline} {emergency.emoji}</h2><p>{emergency.message}</p><strong>{emergency.action}</strong></section>}
  </main>;
}
