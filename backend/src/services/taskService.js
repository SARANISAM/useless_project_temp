import { supabase, TASKS_TABLE } from "../config/supabase.js";
import { AppError } from "../utils/AppError.js";

function dbError(error, message) {
  console.error("[Supabase]", error);
  if (error?.code === "42703") {
    throw new AppError(
      "Database setup required: 'user_id' column missing on 'tasks' table. Please run the SQL in supabase/schema.sql in your Supabase Dashboard SQL Editor.",
      500
    );
  }
  throw new AppError(message, 500);
}

export async function getAllTasks(userId, { completed } = {}) {
  let q = supabase.from(TASKS_TABLE).select("*").eq("user_id", userId).order("deadline_timestamp", { ascending: true });
  if (typeof completed === "boolean") q = q.eq("completed", completed);
  const { data, error } = await q;
  if (error) dbError(error, "Failed to fetch tasks.");
  return data || [];
}

export async function getTaskById(id, userId) {
  const { data, error } = await supabase.from(TASKS_TABLE).select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) dbError(error, "Failed to fetch task.");
  if (!data) throw new AppError("Task not found.", 404);
  return data;
}

export async function createTask(data, userId) {
  const { data: row, error } = await supabase.from(TASKS_TABLE).insert({ ...data, user_id: userId }).select("*").single();
  if (error) dbError(error, "Failed to create task.");
  return row;
}

export async function updateTask(id, updates, userId) {
  const existing = await getTaskById(id, userId);
  if (existing.completed) throw new AppError("Completed tasks cannot be edited. Reopen it only by adding that feature explicitly.", 400);
  const { data, error } = await supabase.from(TASKS_TABLE).update(updates).eq("id", id).eq("user_id", userId).select("*").maybeSingle();
  if (error) dbError(error, "Failed to update task.");
  if (!data) throw new AppError("Task not found.", 404);
  return data;
}

export async function deleteTask(id, userId) {
  await getTaskById(id, userId);
  const { error } = await supabase.from(TASKS_TABLE).delete().eq("id", id).eq("user_id", userId);
  if (error) dbError(error, "Failed to delete task.");
}

export async function startTask(id, userId) {
  const existing = await getTaskById(id, userId);
  if (existing.started_at) return existing;
  const { data, error } = await supabase.from(TASKS_TABLE).update({ started_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId).select("*").maybeSingle();
  if (error) dbError(error, "Failed to start task.");
  if (!data) throw new AppError("Task not found.", 404);
  return data;
}

export async function completeTask(id, userId) {
  await getTaskById(id, userId);
  const now = new Date().toISOString();
  const { data, error } = await supabase.from(TASKS_TABLE).update({ completed: true, completed_at: now }).eq("id", id).eq("user_id", userId).select("*").maybeSingle();
  if (error) dbError(error, "Failed to complete task.");
  if (!data) throw new AppError("Task not found.", 404);
  return data;
}
