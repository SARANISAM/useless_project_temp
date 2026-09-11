import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/AppError.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: Missing or invalid authorization header.", 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError("Unauthorized: Access token missing.", 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError("Unauthorized: Invalid or expired session token.", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
