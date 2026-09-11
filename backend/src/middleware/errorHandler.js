export function errorHandler(err, req, res, next) {
  console.error("[server error]", err);
  const status = Number.isInteger(err.status) ? err.status : 500;
  res.status(status).json({
    success: false,
    error: { message: status >= 500 ? "Something went wrong on the server." : err.message }
  });
}
