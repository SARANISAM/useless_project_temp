import { buildDeadlineTimestamp } from "./deadlineUtils.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const integer = (v) => Number.isInteger(v) && v >= 0;

export function isValidUUID(v) { return typeof v === "string" && UUID.test(v); }

function cleanText(v, name, required = false) {
  if (v === undefined || v === null) {
    if (required) return { error: `${name} is required.` };
    return { value: null };
  }
  if (typeof v !== "string" || (required && !v.trim())) return { error: `${name} must be a non-empty string.` };
  return { value: v.trim() };
}

function deadlineFields(body, errors, data, requireBoth = true) {
  const hasDate = body.deadline_date !== undefined;
  const hasTime = body.deadline_time !== undefined;
  if (requireBoth && (!hasDate || !hasTime)) {
    errors.push("deadline_date and deadline_time are required.");
    return;
  }
  if (!hasDate && !hasTime) return;
  if (hasDate !== hasTime) {
    errors.push("deadline_date and deadline_time must be provided together.");
    return;
  }
  if (typeof body.deadline_date !== "string" || !DATE.test(body.deadline_date)) errors.push("deadline_date must be YYYY-MM-DD.");
  if (typeof body.deadline_time !== "string" || !TIME.test(body.deadline_time)) errors.push("deadline_time must be HH:MM.");
  if (errors.length) return;
  const dt = buildDeadlineTimestamp(body.deadline_date, body.deadline_time);
  if (!dt) errors.push("The deadline is not valid.");
  else {
    data.deadline_date = body.deadline_date;
    data.deadline_time = `${body.deadline_time}:00`;
    data.deadline_timestamp = dt.toISO();
  }
}

export function validateCreateTaskInput(body = {}) {
  const errors = [], data = {};
  const task = cleanText(body.task_name, "task_name", true);
  if (task.error) errors.push(task.error); else data.task_name = task.value;
  const desc = cleanText(body.description, "description");
  if (desc.error) errors.push(desc.error); else data.description = desc.value;
  deadlineFields(body, errors, data, true);

  if (body.chapters !== undefined && body.chapters !== null) {
    if (!integer(body.chapters)) errors.push("chapters must be a non-negative integer.");
    else data.chapters = body.chapters;
  } else data.chapters = null;

  if (body.estimated_minutes !== undefined && body.estimated_minutes !== null) {
    if (!integer(body.estimated_minutes) || body.estimated_minutes > 100000) errors.push("estimated_minutes must be a reasonable non-negative integer.");
    else data.estimated_minutes = body.estimated_minutes;
  } else data.estimated_minutes = null;

  data.completed = false;
  return errors.length ? { valid: false, errors } : { valid: true, data };
}

export function validateUpdateTaskInput(body = {}) {
  const errors = [], data = {};
  if (!body || typeof body !== "object" || Object.keys(body).length === 0) return { valid: false, errors: ["At least one editable field is required."] };
  const forbidden = ["id", "user_id", "created_at", "started_at", "completed_at", "completed"];
  const attempted = forbidden.filter((k) => body[k] !== undefined);
  if (attempted.length) errors.push(`These fields cannot be updated here: ${attempted.join(", ")}.`);

  if (body.task_name !== undefined) {
    const v = cleanText(body.task_name, "task_name", true);
    if (v.error) errors.push(v.error); else data.task_name = v.value;
  }
  if (body.description !== undefined) {
    const v = cleanText(body.description, "description");
    if (v.error) errors.push(v.error); else data.description = v.value;
  }
  if (body.deadline_date !== undefined || body.deadline_time !== undefined) deadlineFields(body, errors, data, true);
  if (body.chapters !== undefined) {
    if (body.chapters !== null && !integer(body.chapters)) errors.push("chapters must be a non-negative integer or null.");
    else data.chapters = body.chapters;
  }
  if (body.estimated_minutes !== undefined) {
    if (body.estimated_minutes !== null && !integer(body.estimated_minutes)) errors.push("estimated_minutes must be a non-negative integer or null.");
    else data.estimated_minutes = body.estimated_minutes;
  }
  return errors.length ? { valid: false, errors } : { valid: true, data };
}
