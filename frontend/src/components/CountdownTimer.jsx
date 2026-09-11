import { useEffect, useState } from "react";
import { formatCountdown } from "../utils/time.js";

export default function CountdownTimer({ deadline, completed }) {
  const [left, setLeft] = useState(Math.max(0, new Date(deadline).getTime() - Date.now()));
  useEffect(() => {
    if (completed) return;
    const tick = () => setLeft(Math.max(0, new Date(deadline).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, completed]);
  return <div className={`countdown ${left <= 3600000 && left > 0 ? "urgent" : ""} ${left === 0 && !completed ? "expired" : ""}`}>
    <span>⏳ TIME LEFT</span>
    <strong>{completed ? "COMPLETED" : formatCountdown(left)}</strong>
  </div>;
}
