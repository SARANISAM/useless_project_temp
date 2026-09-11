import * as taskService from "../services/taskService.js";
import { calculateDeadlineState, stageForPanicState } from "../utils/deadlineUtils.js";
import { isValidUUID, validateCreateTaskInput, validateUpdateTaskInput } from "../utils/validation.js";
import { AppError } from "../utils/AppError.js";

export function withDeadlineInfo(task) {
  return { ...task, deadline: calculateDeadlineState(task.deadline_timestamp, { completed: task.completed }) };
}
function requireId(id) { if (!isValidUUID(id)) throw new AppError("Invalid task id.", 400); }

export async function listTasks(req, res, next) {
  try {
    let completed;
    if (req.query.completed !== undefined) {
      if (!["true", "false"].includes(req.query.completed)) throw new AppError("completed must be true or false.", 400);
      completed = req.query.completed === "true";
    }
    const tasks = await taskService.getAllTasks({ completed });
    res.json({ success: true, data: tasks.map(withDeadlineInfo) });
  } catch (e) { next(e); }
}
export async function getTask(req, res, next) {
  try { requireId(req.params.id); res.json({ success: true, data: withDeadlineInfo(await taskService.getTaskById(req.params.id)) }); }
  catch (e) { next(e); }
}
export async function createTask(req, res, next) {
  try {
    const result = validateCreateTaskInput(req.body);
    if (!result.valid) throw new AppError(result.errors.join(" "), 400);
    const task = await taskService.createTask(result.data);
    res.status(201).json({ success: true, data: withDeadlineInfo(task) });
  } catch (e) { next(e); }
}
export async function updateTask(req, res, next) {
  try {
    requireId(req.params.id);
    const result = validateUpdateTaskInput(req.body);
    if (!result.valid) throw new AppError(result.errors.join(" "), 400);
    res.json({ success: true, data: withDeadlineInfo(await taskService.updateTask(req.params.id, result.data)) });
  } catch (e) { next(e); }
}
export async function deleteTask(req, res, next) {
  try { requireId(req.params.id); await taskService.deleteTask(req.params.id); res.json({ success: true, data: { id: req.params.id } }); }
  catch (e) { next(e); }
}
export async function startTask(req, res, next) {
  try { requireId(req.params.id); res.json({ success: true, data: withDeadlineInfo(await taskService.startTask(req.params.id)) }); }
  catch (e) { next(e); }
}
export async function completeTask(req, res, next) {
  try { requireId(req.params.id); res.json({ success: true, data: withDeadlineInfo(await taskService.completeTask(req.params.id)) }); }
  catch (e) { next(e); }
}
