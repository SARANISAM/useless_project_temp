import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "../services/api.js";
import { getLocalDateTimeParts } from "../utils/time.js";
import TaskCard from "../components/TaskCard.jsx";
import EmergencyButton from "../components/EmergencyButton.jsx";

export default function ViewTasks({ onToast }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emergency, setEmergency] = useState(null);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await api.getTasks(); setTasks(r.data); } catch (e) { onToast(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const active = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const todayKey = getLocalDateTimeParts().date;
  const today = active.filter(t => t.deadline.panicState !== "DEADLINE_DEAD" && t.deadline_date === todayKey);
  const overdue = active.filter(t => t.deadline.panicState === "DEADLINE_DEAD");
  const upcoming = active.filter(t => !today.includes(t) && !overdue.includes(t));

  async function emergencyHelp() {
    setEmergencyLoading(true);
    try { const r = await api.emergency(); setEmergency(r.data); } catch(e) { onToast(e.message); } finally { setEmergencyLoading(false); }
  }
  const section = (title, list) => <section className="task-section"><div className="section-title"><h2>{title}</h2><span>{list.length}</span></div>{list.length ? <div className="task-grid">{list.map(t => <TaskCard key={t.id} task={t} onChanged={load} onToast={onToast}/>)}</div> : <div className="empty">Nothing here. 😌</div>}</section>;

  return <main>
    <div className="page-heading row-heading"><div><div className="pill">LIVE TASK BOARD</div><h1>Your procrastination portfolio.</h1><p>All data comes from Supabase. Panic state comes from the backend clock.</p></div><div className="heading-actions"><EmergencyButton onClick={emergencyHelp} loading={emergencyLoading}/><button className="secondary" onClick={load}><RefreshCw size={17}/> Refresh</button></div></div>
    {emergency && <div className="emergency-result compact"><div className="eyebrow">🚨 EMERGENCY AI · {emergency.taskName || "NO TASK"}</div><h2>{emergency.headline} {emergency.emoji}</h2><p>{emergency.message}</p><strong>{emergency.action}</strong></div>}
    {loading ? <div className="loading">Loading database... ☕</div> : tasks.length === 0 ? <div className="empty large">No tasks found. Congratulations. You have procrastinated so efficiently that there is nothing left to procrastinate about. 😂</div> : <>{section("🔥 TODAY'S DEADLINES", today)}{section("⏳ UPCOMING", upcoming)}{section("💀 OVERDUE", overdue)}</>}
  </main>;
}
