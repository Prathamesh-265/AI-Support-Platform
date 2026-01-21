import api from "./api.js";

export const getHistory = async () => {
  const { data } = await api.get("/api/chat/history");
  return data.data;
};

export const sendChatMessage = async (message) => {
  const { data } = await api.post("/api/chat/send", { message });
  return data.data;
};

export const clearHistory = async () => {
  const { data } = await api.delete("/api/chat/clear");
  return data;
};
