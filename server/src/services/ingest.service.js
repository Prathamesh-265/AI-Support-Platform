import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

export const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return (data.text || "").trim();
  }

  // fallback for .txt or others
  try {
    const text = fs.readFileSync(filePath, "utf-8");
    return (text || "").trim();
  } catch {
    return "";
  }
};
