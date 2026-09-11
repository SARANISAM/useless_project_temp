import { useEffect, useState } from "react";
import { api } from "../services/api.js";
export default function History({ onToast }) {
  const [s, setS] = useState(null);
  useEffect(() => { api.stats().then(r => setS(r.data)).catch(e => onToast(e.message)); }, []);
  const mins = s?.totalProcrastinationMinutes ?? 0;
  return <main>
    <div className="page-heading"><div className="pill">HISTORY</div><h1>The statistics are judging you.</h1><p>Calculated from actual Supabase records and server timestamps.</p></div>
    <section className="history-grid">
      <div className="history-card"><span>Total Tasks</span><strong>{s?.total ?? "—"}</strong></div>
      <div className="history-card"><span>Completed</span><strong>{s?.completed ?? "—"}</strong></div>
      <div className="history-card"><span>Overdue</span><strong>{s?.overdue ?? "—"}</strong></div>
      <div className="history-card"><span>Today's Deadlines</span><strong>{s?.today ?? "—"}</strong></div>
      <div className="history-card wide"><span>Total Procrastination Time*</span><strong>{Math.floor(mins / 60)}h {mins % 60}m</strong><small>*Time between task creation and first START TASK click.</small></div>
      <div className="history-card"><span>Average Procrastination</span><strong>{s?.averageProcrastinationMinutes ?? 0} min</strong></div>
      <div className="history-card"><span>Most Dangerous Day</span><strong>{s?.mostDangerousDay ?? "—"} 😭</strong></div>
    </section>
  </main>;
}
