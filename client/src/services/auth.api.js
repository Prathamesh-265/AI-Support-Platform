import api from "./api.js";

export const registerUser = async (payload) => {
  try {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  } catch (err) {
    console.log("REGISTER ERROR FULL:", err);
    console.log("REGISTER ERROR RESPONSE:", err?.response?.data);
    throw err;
  }
};

export const loginUser = async (payload) => {
  try {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
  } catch (err) {
    console.log("LOGIN ERROR FULL:", err);
    console.log("LOGIN ERROR RESPONSE:", err?.response?.data);
    throw err;
  }
};

export const getMe = async () => {
  const { data } = await api.get("/api/auth/me");
  return data.data;
};
