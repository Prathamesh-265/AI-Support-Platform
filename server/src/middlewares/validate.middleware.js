export const validateMessage = (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      message: "Message is required and must be a string",
    });
  }

  const cleaned = message.trim();

  if (cleaned.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message cannot be empty",
    });
  }

  if (cleaned.length > 5000) {
    return res.status(400).json({
      success: false,
      message: "Message exceeds maximum length of 5000 characters",
    });
  }

  req.body.message = cleaned;
  next();
};

export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File is required",
    });
  }

  const allowedMimes = ["application/pdf", "text/plain", "text/markdown"];
  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Only PDF, TXT, and MD files are allowed",
    });
  }

  next();
};
