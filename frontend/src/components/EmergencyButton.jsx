import { Siren } from "lucide-react";
export default function EmergencyButton({ onClick, loading }) {
  return <button className="emergency" onClick={onClick} disabled={loading}>
    <Siren size={20}/>{loading ? "AI IS PANICKING..." : "I HAVE 10 MINUTES LEFT — HELP"}
  </button>;
}
