const meta = {
  CHILL: ["🟢", "CHILL", "low"],
  MAYBE_START: ["🟡", "MAYBE START", "medium"],
  OKAY_SERIOUS: ["🟠", "OKAY SERIOUS", "high"],
  PANIC_MODE: ["🔴", "PANIC MODE", "critical"],
  DEADLINE_DEAD: ["💀", "DEADLINE DEAD", "dead"],
  COMPLETED: ["✅", "DONE", "done"]
};
export default function PanicMeter({ state }) {
  const [emoji, label, cls] = meta[state] || meta.CHILL;
  return <div className={`panic ${cls}`}><span>{emoji}</span><b>{label}</b><span className="panic-label">PANIC LEVEL</span></div>;
}
