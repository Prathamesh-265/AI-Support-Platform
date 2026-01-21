import api from "./api.js";

export const listDocs = async () => {
  const { data } = await api.get("/api/documents");
  return data.data?.documents || data.data || [];
};

export const uploadDoc = async (file) => {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post("/api/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data.data;
};

export const deleteDoc = async (id) => {
  const { data } = await api.delete(`/api/documents/${id}`);
  return data;
};
