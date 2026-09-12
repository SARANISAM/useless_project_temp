import { DateTime } from "luxon";
import * as taskService from "../services/taskService.js";
import { calculateDeadlineState, stageForPanicState } from "../utils/deadlineUtils.js";
import { generateAiMessage } from "../services/geminiService.js";
import { getFallbackMessage } from "../utils/fallbackMessages.js";
import { AppError } from "../utils/AppError.js";
import { isValidUUID } from "../utils/validation.js";
import { env } from "../config/env.js";

function contextFromTask(task, mode = "normal") {
  const state = calculateDeadlineState(task.deadline_timestamp, { completed: task.completed });
  const deadlineLocal = DateTime.fromISO(task.deadline_timestamp).setZone(env.APP_TIMEZONE).toFormat("dd LLL yyyy, hh:mm a");
  const mins = state.timeRemainingMinutes;
  const timeRemaining = state.isOverdue ? "deadline passed" :
    mins >= 60 ? `${Math.floor(mins / 60)} hour(s) ${mins % 60} minute(s)` :
    `${mins} minute(s)`;
  return {
    task_name: task.task_name,
    description: task.description,
    deadline_local: deadlineLocal,
    time_remaining: timeRemaining,
    chapters: task.chapters,
    estimated_minutes: task.estimated_minutes,
    panic_state: state.panicState,
    stage: stageForPanicState(state.panicState),
    mode
  };
}

export async function taskAiMessage(req, res, next) {
  try {
    if (!isValidUUID(req.params.id)) throw new AppError("Invalid task id.", 400);
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    const context = contextFromTask(task);
    const message = await generateAiMessage(context);
    res.json({ success: true, data: { taskId: task.id, ...message, generatedAt: new Date().toISOString() } });
  } catch (e) { next(e); }
}

export async function emergency(req, res, next) {
  try {
    const tasks = await taskService.getAllTasks(req.user.id, { completed: false });
    if (!tasks.length) {
      return res.json({
        success: true,
        data: {
          taskId: null,
          panic_level: "LOW",
          headline: "😌 NO EMERGENCY",
          message: "Bro... emergency button press cheythu. Pakshe task onnum illa. 😂",
          action: "Oru task create cheyyu.",
          emoji: "😂"
        }
      });
    }
    const active = tasks
      .map((t) => ({ task: t, state: calculateDeadlineState(t.deadline_timestamp, { completed: t.completed }) }))
      .sort((a, b) => new Date(a.task.deadline_timestamp) - new Date(b.task.deadline_timestamp))[0];
    const context = contextFromTask(active.task, "emergency");
    const message = await generateAiMessage(context, "emergency");
    res.json({ success: true, data: { taskId: active.task.id, taskName: active.task.task_name, ...message } });
  } catch (e) { next(e); }
}

export async function stats(req, res, next) {
  try {
    const tasks = await taskService.getAllTasks(req.user.id);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const now = Date.now();
    const overdue = tasks.filter((t) => !t.completed && new Date(t.deadline_timestamp).getTime() <= now).length;
    const todayKey = DateTime.now().setZone(env.APP_TIMEZONE).toISODate();
    const today = tasks.filter((t) => !t.completed && t.deadline_date === todayKey).length;
    const upcoming = tasks.filter((t) => !t.completed && new Date(t.deadline_timestamp).getTime() > now && t.deadline_date !== todayKey).length;

    const procrastinationMs = tasks.reduce((sum, t) => {
      if (!t.started_at) return sum;
      const start = new Date(t.started_at).getTime();
      const created = new Date(t.created_at).getTime();
      return sum + Math.max(0, start - created);
    }, 0);

    const started = tasks.filter((t) => t.started_at);
    const avgStartMinutes = started.length
      ? Math.round(procrastinationMs / started.length / 60000)
      : 0;

    const weekdayCounts = {};
    tasks.filter((t) => t.started_at).forEach((t) => {
      const day = DateTime.fromISO(t.started_at).setZone(env.APP_TIMEZONE).toFormat("cccc");
      weekdayCounts[day] = (weekdayCounts[day] || 0) + 1;
    });
    const dangerous = Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Not enough data";

    res.json({
      success: true,
      data: {
        total, completed, overdue, today, upcoming,
        totalProcrastinationMinutes: Math.round(procrastinationMs / 60000),
        averageProcrastinationMinutes: avgStartMinutes,
        mostDangerousDay: dangerous
      }
    });
  } catch (e) { next(e); }
}
