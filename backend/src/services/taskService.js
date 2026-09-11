import { supabase, TASKS_TABLE } from "../config/supabase.js";
import { AppError } from "../utils/AppError.js";

function dbError(error, message) {
  console.error("[Supabase]", error);
  throw new AppError(message, 500);
}

export async function getAllTasks({ completed } = {}) {
  let q = supabase.from(TASKS_TABLE).select("*").order("deadline_timestamp", { ascending: true });
  if (typeof completed === "boolean") q = q.eq("completed", completed);
  const { data, error } = await q;
  if (error) dbError(error, "Failed to fetch tasks.");
  return data || [];
}

export async function getTaskById(id) {
  const { data, error } = await supabase.from(TASKS_TABLE).select("*").eq("id", id).maybeSingle();
  if (error) dbError(error, "Failed to fetch task.");
  if (!data) throw new AppError("Task not found.", 404);
  return data;
}

export async function createTask(data) {
  const { data: row, error } = await supabase.from(TASKS_TABLE).insert(data).select("*").single();
  if (error) dbError(error, "Failed to create task.");
  return row;
}

export async function updateTask(id, updates) {
  const existing = await getTaskById(id);
  if (existing.completed) throw new AppError("Completed tasks cannot be edited. Reopen it only by adding that feature explicitly.", 400);
  const { data, error } = await supabase.from(TASKS_TABLE).update(updates).eq("id", id).select("*").maybeSingle();
  if (error) dbError(error, "Failed to update task.");
  if (!data) throw new AppError("Task not found.", 404);
  return data;
}

export async function deleteTask(id) {
  await getTaskById(id);
  const { error } = await supabase.from(TASKS_TABLE).delete().eq("id", id);
  if (error) dbError(error, "Failed to delete task.");
}

export async function startTask(id) {
  const existing = await getTaskById(id);
  if (existing.started_at) return existing;
  const { data, error } = await supabase.from(TASKS_TABLE).update({ started_at: new Date().toISOString() }).eq("id", id).select("*").maybeSingle();
  if (error) dbError(error, "Failed to start task.");
  if (!data) throw new AppError("Task not found.", 404);
  return data;
}

export async function completeTask(id) {
  await getTaskById(id);
  const now = new Date().toISOString();
  const { data, error } = await supabase.from(TASKS_TABLE).update({ completed: true, completed_at: now }).eq("id", id).select("*").maybeSingle();
  if (error) dbError(error, "Failed to complete task.");
  if (!data) throw new AppError("Task not found.", 404);
  return data;
}
