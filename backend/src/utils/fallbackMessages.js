const fallback = {
  CHILL: {
    panic_level: "LOW", headline: "😌 CHILL MODE", message: "AI ippol tea kudikkan poyi. 😂 Pakshe deadline nokkiyal nalla time undu. Chill cheythittu oru point-il start cheyyu.", action: "Oru small start mathi.", emoji: "😌"
  },
  MAYBE_START: {
    panic_level: "MEDIUM", headline: "🟡 MAYBE START", message: "AI offline aanu. 😂 Pakshe 24 hours-il thazhe aanu enkil reels kurach kurachu, task kurach kurachu start cheyyam.", action: "Oru chapter thudangu.", emoji: "🫠"
  },
  OKAY_SERIOUS: {
    panic_level: "HIGH", headline: "🟠 OKAY SERIOUS", message: "Situation kurach serious aanu. 😭 Important topics first. Perfect aakan nokkenda; progress mathi.", action: "Ippo thanne start cheyyu.", emoji: "😭"
  },
  PANIC_MODE: {
    panic_level: "CRITICAL", headline: "🚨 PANIC MODE", message: "Okay bro/sis... comedy kurach serious aayi. 😭 Time kuravanu. Important topics first, distractions close.", action: "JUST START. 🔥", emoji: "😭🔥"
  },
  DEADLINE_DEAD: {
    panic_level: "DEAD", headline: "💀 DEADLINE DEAD", message: "Deadline kazhinju. 😭 Pakshe game over alla. Remaining important work nokki continue cheyyu.", action: "Poyi start cheyyu.", emoji: "💀"
  },
  COMPLETED: {
    panic_level: "DONE", headline: "🎉 TASK DONE", message: "WAIT... nee actually cheytho? Database itself is shocked. 😂", action: "Proud of you.", emoji: "😂🔥"
  }
};
export function getFallbackMessage(state = "CHILL") { return fallback[state] || fallback.CHILL; }
