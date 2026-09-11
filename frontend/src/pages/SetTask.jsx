import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Save } from "lucide-react";
import { api } from "../services/api.js";
import { getLocalDateTimeParts } from "../utils/time.js";

export default function SetTask({ onToast }) {
  const nav = useNavigate();
  const initial = getLocalDateTimeParts();
  const [form, setForm] = useState({ task_name: "", deadline_date: initial.date, deadline_time: initial.time, description: "", chapters: "", estimated_minutes: "" });
  const [loading, setLoading] = useState(false);
  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    if (!form.task_name.trim()) return onToast("Task name kodukkanam. 😂");
    setLoading(true);
    try {
      const payload = { ...form, chapters: form.chapters === "" ? null : Number(form.chapters), estimated_minutes: form.estimated_minutes === "" ? null : Number(form.estimated_minutes) };
      await api.createTask(payload);
      onToast("Task database-il kayari. Ini responsibility ninte aanu. 😂");
      nav("/tasks");
    } catch (err) { onToast(err.message); } finally { setLoading(false); }
  }
  return <main className="narrow">
    <button className="back" onClick={() => nav(-1)}><ArrowLeft size={17}/> Back</button>
    <div className="page-heading"><div className="pill">NEW TASK</div><h1>Set a deadline. Regret later. 😌</h1><p>Database will remember even if you don't.</p></div>
    <form className="form-card" onSubmit={submit}>
      <label>Task name *<input name="task_name" value={form.task_name} onChange={set} placeholder="Study Computer Networks" maxLength={160}/></label>
      <div className="two-col">
        <label>Deadline date *<input type="date" name="deadline_date" value={form.deadline_date} onChange={set}/></label>
        <label>Deadline time *<input type="time" name="deadline_time" value={form.deadline_time} onChange={set}/></label>
      </div>
      <label>Description <textarea name="description" value={form.description} onChange={set} placeholder="Complete Module 3 and revise TCP." maxLength={1000}/></label>
      <div className="two-col">
        <label>Chapters / topics <input type="number" min="0" name="chapters" value={form.chapters} onChange={set} placeholder="4"/></label>
        <label>Estimated work (minutes) <input type="number" min="0" name="estimated_minutes" value={form.estimated_minutes} onChange={set} placeholder="60"/></label>
      </div>
      <button className="primary big full" disabled={loading}><Save size={19}/>{loading ? "Saving..." : "Create Task"}</button>
      <div className="form-note"><CalendarPlus size={17}/> Deadline is interpreted in <b>Asia/Kolkata</b> and the backend clock is authoritative.</div>
    </form>
  </main>;
}
