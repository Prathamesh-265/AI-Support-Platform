export const errorMiddleware = (err, req, res, next) => {
  const status = err?.statusCode || err?.status || 500;

  const message =
    err?.message || (status === 500 ? "Internal Server Error" : "Request failed");

  console.error("❌ ERROR:", {
    method: req.method,
    url: req.originalUrl,
    status,
    message,
    stack: err?.stack,
  });

  return res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : err,
  });
};
