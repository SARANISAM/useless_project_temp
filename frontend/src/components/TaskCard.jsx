import { useEffect, useRef, useState } from "react";
import { Check, Play, RefreshCw, Trash2 } from "lucide-react";
import { api } from "../services/api.js";
import CountdownTimer from "./CountdownTimer.jsx";
import PanicMeter from "./PanicMeter.jsx";
import { formatDeadline } from "../utils/time.js";

export default function TaskCard({ task, onChanged, onToast }) {
  const [ai, setAi] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const expiredRequested = useRef(false);

  useEffect(() => {
    setAi(null);
    expiredRequested.current = false;
  }, [task.id, task.deadline_timestamp, task.completed]);

  useEffect(() => {
    if (task.completed) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [task.completed]);

  const remainingMs = Math.max(0, new Date(task.deadline_timestamp).getTime() - now);
  const liveState = task.completed ? "COMPLETED" :
    remainingMs <= 0 ? "DEADLINE_DEAD" :
    remainingMs <= 3600000 ? "PANIC_MODE" :
    remainingMs <= 6 * 3600000 ? "OKAY_SERIOUS" :
    remainingMs <= 24 * 3600000 ? "MAYBE_START" : "CHILL";

  useEffect(() => {
    if (task.completed || liveState !== "DEADLINE_DEAD" || expiredRequested.current) return;
    expiredRequested.current = true;
    generate();
  }, [task.completed, liveState]);

  async function generate() {
    setLoadingAi(true);
    try { const r = await api.aiMessage(task.id); setAi(r.data); }
    catch (e) { onToast(e.message); }
    finally { setLoadingAi(false); }
  }
  async function start() {
    setBusy(true);
    try { await api.startTask(task.id); onChanged(); onToast("Task started. 😭"); }
    catch (e) { onToast(e.message); } finally { setBusy(false); }
  }
  async function complete() {
    setBusy(true);
    try { await api.completeTask(task.id); onChanged(); onToast("WAIT... YOU ACTUALLY DID IT? 😂🔥"); }
    catch (e) { onToast(e.message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!confirm(`Delete "${task.task_name}"?`)) return;
    setBusy(true);
    try { await api.deleteTask(task.id); onChanged(); onToast("Task deleted. Database has forgotten. 🫡"); }
    catch (e) { onToast(e.message); } finally { setBusy(false); }
  }

  const state = liveState;
  return <article className={`task-card ${state.toLowerCase()}`}>
    <div className="task-top">
      <div><div className="eyebrow">TASK</div><h3>{task.task_name}</h3></div>
      <PanicMeter state={state}/>
    </div>
    {task.description && <p className="description">{task.description}</p>}
    <div className="task-meta">
      <span>📅 {formatDeadline(task.deadline_timestamp)}</span>
      {task.chapters != null && <span>📚 {task.chapters} chapters</span>}
      {task.estimated_minutes != null && <span>⏱ {task.estimated_minutes} min work</span>}
    </div>
    <CountdownTimer deadline={task.deadline_timestamp} completed={task.completed}/>
    <div className="ai-box">
      <div className="ai-title">🤖 AI SAYS</div>
      {ai ? <><h4>{ai.headline} {ai.emoji}</h4><p>{ai.message}</p><strong>{ai.action}</strong></> :
        <p className="muted">Generate a fresh Manglish procrastination analysis for this task.</p>}
    </div>
    <div className="actions">
      {!task.completed && !task.started_at && <button className="secondary" disabled={busy} onClick={start}><Play size={16}/> Start Task</button>}
      {!task.completed && <button className="primary" disabled={busy} onClick={complete}><Check size={16}/> Mark Complete</button>}
      <button className="secondary" disabled={loadingAi} onClick={generate}><RefreshCw size={16} className={loadingAi ? "spin" : ""}/> {loadingAi ? "Thinking..." : "Refresh AI"}</button>
      <button className="icon-btn danger" disabled={busy} onClick={remove} aria-label="Delete task"><Trash2 size={17}/></button>
    </div>
  </article>;
}
